import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Recuperacao } from './recuperacao.schema';
import { EmailService } from './email.service';

export const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
@Injectable()
export class RecuperacaoService {
  private readonly logger = new Logger(RecuperacaoService.name);
  constructor(
    @InjectModel(Usuario.name) private readonly usuarios: Model<Usuario>,
    @InjectModel(Recuperacao.name)
    private readonly recuperacoes: Model<Recuperacao>,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}
  async solicitar(email: string) {
    if (!this.email.configurado())
      throw new ServiceUnavailableException(
        'A recuperação por e-mail ainda não foi configurada. Entre em contato com a clínica.',
      );
    let origem: URL;
    try {
      origem = new URL(
        this.config.get<string>('FRONTEND_URL') || 'http://localhost:4200',
      );
      if (!['http:', 'https:'].includes(origem.protocol))
        throw new Error('Protocolo inválido');
    } catch {
      throw new ServiceUnavailableException('Configure o endereço do portal.');
    }
    const mensagem =
      'Se houver uma conta de paciente com este e-mail, você receberá as instruções para recuperar o acesso.';
    const usuario = await this.usuarios
      .findOne({
        email: email.trim().toLowerCase(),
        perfil: 'paciente',
        ativo: true,
      })
      .lean()
      .exec();
    if (!usuario) return { mensagem };
    const recente = await this.recuperacoes
      .findOne({ usuario: usuario._id })
      .lean()
      .exec();
    if (
      recente &&
      (recente.updatedAt ?? recente.createdAt).getTime() > Date.now() - 60000
    )
      return { mensagem };
    const token = randomBytes(32).toString('hex');
    const salvo = await this.recuperacoes
      .findOneAndUpdate(
        { usuario: usuario._id },
        {
          $set: {
            tokenHash: hashToken(token),
            expiraEm: new Date(Date.now() + 30 * 60000),
          },
        },
        { upsert: true, returnDocument: 'after', runValidators: true },
      )
      .lean()
      .exec();
    const link = new URL('/nova-senha', origem);
    link.searchParams.set('token', token);
    try {
      await this.email.enviarRecuperacao(usuario.email, link.href);
    } catch {
      // A resposta não revela se o e-mail está cadastrado, mesmo em falhas do provedor.
      if (salvo)
        await this.recuperacoes.deleteOne({
          _id: salvo._id,
          tokenHash: hashToken(token),
        });
      this.logger.error(
        'O provedor de e-mail recusou uma entrega de recuperação. Confira a configuração SMTP.',
      );
    }
    return { mensagem };
  }
  async redefinir(token: string, senha: string) {
    const recuperacao = await this.recuperacoes
      .findOneAndDelete({
        tokenHash: hashToken(token),
        expiraEm: { $gt: new Date() },
      })
      .lean()
      .exec();
    if (!recuperacao)
      throw new BadRequestException(
        'O link é inválido, já foi utilizado ou expirou. Solicite um novo.',
      );
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await this.usuarios
      .findOneAndUpdate(
        { _id: recuperacao.usuario, perfil: 'paciente', ativo: true },
        { $set: { senhaHash, versaoSessao: randomBytes(24).toString('hex') } },
        { returnDocument: 'after', runValidators: true },
      )
      .lean()
      .exec();
    if (!usuario)
      throw new BadRequestException(
        'O link não está disponível. Solicite um novo.',
      );
    await this.recuperacoes.deleteMany({ usuario: usuario._id });
    return {
      mensagem: 'Senha atualizada. Entre novamente com sua nova senha.',
    };
  }
}
