import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      .select('+senhaHash')
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
    await this.buscarContaPaciente(id);
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
