import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Paciente, PacienteSchema } from '../pacientes/schemas/paciente.schema';
import { Consulta, ConsultaSchema } from '../consultas/schemas/consulta.schema';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paciente.name, schema: PacienteSchema },
      { name: Consulta.name, schema: ConsultaSchema },
    ]),
  ],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}
