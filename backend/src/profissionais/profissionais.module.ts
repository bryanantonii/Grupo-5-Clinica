import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfissionaisController } from './profissionais.controller';
import { ProfissionaisService } from './profissionais.service';
import { ProfissionaisEspecialidadesService } from './profissionais-especialidades.service';
import {
  Profissional,
  ProfissionalSchema,
} from './schemas/profissional.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Profissional.name, schema: ProfissionalSchema },
    ]),
  ],
  controllers: [ProfissionaisController],
  providers: [ProfissionaisService, ProfissionaisEspecialidadesService],
  exports: [ProfissionaisService],
})
export class ProfissionaisModule {}
