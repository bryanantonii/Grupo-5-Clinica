import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Consulta, ConsultaSchema } from './schemas/consulta.schema';
import { ConsultasService } from './consultas.service';
import { ConsultasController } from './consultas.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Consulta.name, schema: ConsultaSchema },
    ]),
  ],
  controllers: [ConsultasController],
  providers: [ConsultasService],
  exports: [ConsultasService],
})
export class ConsultasModule {}
