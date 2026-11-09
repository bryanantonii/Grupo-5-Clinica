import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { Recuperacao, RecuperacaoSchema } from './recuperacao.schema';
import { RecuperacaoController } from './recuperacao.controller';
import { RecuperacaoService } from './recuperacao.service';
import { EmailService } from './email.service';
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Recuperacao.name, schema: RecuperacaoSchema },
    ]),
  ],
  controllers: [RecuperacaoController],
  providers: [RecuperacaoService, EmailService],
})
export class RecuperacaoModule {}
