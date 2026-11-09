import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contato, ContatoSchema } from './contatos.schema';
import { ContatosController } from './contatos.controller';
import { ContatosService } from './contatos.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contato.name, schema: ContatoSchema }]),
  ],
  controllers: [ContatosController],
  providers: [ContatosService],
})
export class ContatosModule {}
