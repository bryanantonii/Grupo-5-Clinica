import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Paciente, PacienteSchema } from './schemas/paciente.schema';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paciente.name, schema: PacienteSchema },
    ]),
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService],
})
export class PacientesModule {}
