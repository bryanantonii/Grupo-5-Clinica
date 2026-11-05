import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './schemas/usuario.schema';

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
}
