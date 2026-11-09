import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Paciente, PacienteSchema } from '../pacientes/schemas/paciente.schema';
import { Consulta, ConsultaSchema } from '../consultas/schemas/consulta.schema';
import { ConsultasModule } from '../consultas/consultas.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AgendaPublicaController, PortalController } from './portal.controller';
import { PortalService } from './portal.service';

@Module({
  imports: [
    UsuariosModule,
    ConsultasModule,
    MongooseModule.forFeature([
      { name: Paciente.name, schema: PacienteSchema },
      { name: Consulta.name, schema: ConsultaSchema },
    ]),
  ],
  providers: [PortalService],
  controllers: [PortalController, AgendaPublicaController],
})
export class PortalModule {}
