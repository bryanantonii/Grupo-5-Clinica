import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  ServiceUnavailableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './schemas/usuario.schema';
import {
  CadastroPacienteDto,
  AtualizarContaPacienteDto,
} from './dto/conta-paciente.dto';
import { traduzirDuplicidade, validarId } from '../cadastros/validacao';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly model: Model<Usuario>,
    @Optional() @InjectConnection() private readonly conexao?: Connection,
  ) {}

  async criar(dto: CreateUsuarioDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.model.findOne({ email }).lean().exec())
      throw new ConflictException('Já existe um usuário com este e-mail.');
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    try {
      const usuario = await this.model.create({
        nome: dto.nome.trim(),
        email,
        senhaHash,
        perfil: 'atendente',
        ativo: true,
      });
      const dados = usuario.toObject();
      return {
        _id: String(dados._id),
        nome: dados.nome,
        email: dados.email,
        perfil: dados.perfil,
        ativo: dados.ativo,
      };
    } catch (erro: unknown) {
      if (
        typeof erro === 'object' &&
        erro !== null &&
        'code' in erro &&
        erro.code === 11000
      )
        throw new ConflictException('Já existe um usuário com este e-mail.');
      throw erro;
    }
  }

  buscarPorEmailComSenha(email: string) {
    return this.model
      .findOne({ email: email.trim().toLowerCase() })
      .select('+senhaHash +versaoSessao')
      .lean()
      .exec();
  }

  listar() {
    return this.model
      .find()
      .select('nome email perfil ativo')
      .sort({ nome: 1 })
      .lean()
      .exec();
  }

  async vincularPaciente(id: string, pacienteId: string) {
    validarId(id);
    validarId(pacienteId);
    const usuario = await this.buscarContaPaciente(id);
    if (!this.conexao)
      throw new ServiceUnavailableException('Conexão indisponível.');
    const pacientes = this.conexao.collection('pacientes');
    const paciente = await pacientes.findOne({
      _id: new Types.ObjectId(pacienteId),
      ativo: true,
    });
    if (!paciente || paciente['email'] !== usuario.email)
      throw new BadRequestException(
        'Escolha um cadastro ativo com o mesmo e-mail da conta conferida.',
      );
    if (
      await pacientes.findOne({
        usuario: new Types.ObjectId(id),
        _id: { $ne: paciente._id },
      })
    )
      throw new ConflictException(
        'Esta conta já está vinculada a outro cadastro.',
      );
    try {
      const vinculado = await pacientes.findOneAndUpdate(
        {
          _id: paciente._id,
          $or: [
            { usuario: { $exists: false } },
            { usuario: null },
            { usuario: new Types.ObjectId(id) },
          ],
        },
        { $set: { usuario: new Types.ObjectId(id) } },
        { returnDocument: 'after' },
      );
      if (!vinculado)
        throw new ConflictException('O cadastro já pertence a outra conta.');
      return { paciente: String(vinculado._id), usuario: id };
    } catch (e) {
      traduzirDuplicidade(e, 'Esta conta já foi vinculada. Atualize os dados.');
    }
  }

  buscarEstadoSessao(id: string) {
    return this.model
      .findById(id)
      .select('ativo perfil +versaoSessao')
      .lean()
      .exec();
  }

  async buscarPorId(id: string) {
    if (!/^[a-f\d]{24}$/i.test(id))
      throw new BadRequestException('ID do usuário inválido.');
    const usuario = await this.model.findById(id).lean().exec();
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');
    return {
      _id: String(usuario._id),
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      ativo: usuario.ativo,
    };
  }

  async criarPaciente(dto: CadastroPacienteDto) {
    const email = dto.email.trim().toLowerCase();
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    try {
      // Perfil, status e IDs de terceiros nunca vêm do visitante.
      await this.model.create({
        nome: dto.nome.trim(),
        email,
        senhaHash,
        perfil: 'paciente',
        ativo: true,
      });
    } catch (erro) {
      traduzirDuplicidade(erro, 'Já existe uma conta com este e-mail.');
    }
  }

  async buscarContaPaciente(id: string) {
    validarId(id);
    const usuario = await this.model
      .findOne({ _id: id, perfil: 'paciente', ativo: true })
      .lean()
      .exec();
    if (!usuario)
      throw new UnauthorizedException('Conta indisponível. Entre novamente.');
    return {
      _id: String(usuario._id),
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      telefone: usuario.telefone ?? '',
    };
  }

  async atualizarContaPaciente(id: string, dto: AtualizarContaPacienteDto) {
    const anterior = await this.buscarContaPaciente(id);
    const dados = {
      nome: dto.nome.trim(),
      email: dto.email.trim().toLowerCase(),
      ...(dto.telefone !== undefined ? { telefone: dto.telefone.trim() } : {}),
    };
    try {
      const atualizado = await this.model
        .findOneAndUpdate(
          { _id: id, perfil: 'paciente', ativo: true },
          { $set: dados },
          { returnDocument: 'after', runValidators: true },
        )
        .lean()
        .exec();
      if (!atualizado)
        throw new UnauthorizedException('Conta indisponível. Entre novamente.');
      try {
        // O vínculo é pelo ID da conta; e-mails iguais nunca concedem acesso a outro paciente.
        await this.conexao
          ?.collection('pacientes')
          .updateOne({ usuario: new Types.ObjectId(id) }, { $set: dados });
      } catch (erro) {
        // Evita confirmar uma alteração parcial de contato se o cadastro clínico recusar o e-mail.
        await this.model
          .updateOne(
            { _id: id, updatedAt: atualizado.updatedAt },
            {
              $set: {
                nome: anterior.nome,
                email: anterior.email,
                telefone: anterior.telefone,
              },
            },
          )
          .exec();
        throw erro;
      }
      return {
        _id: String(atualizado._id),
        nome: atualizado.nome,
        email: atualizado.email,
        perfil: atualizado.perfil,
        telefone: atualizado.telefone ?? '',
      };
    } catch (erro) {
      traduzirDuplicidade(erro, 'Já existe uma conta com este e-mail.');
    }
  }
}
