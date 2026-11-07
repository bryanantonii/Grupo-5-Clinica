import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Especialidade,
  EspecialidadeSchema,
} from './schemas/especialidade.schema';
import { EspecialidadesService } from './especialidades.service';
import { EspecialidadesController } from './especialidades.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Especialidade.name, schema: EspecialidadeSchema },
    ]),
  ],
  controllers: [EspecialidadesController],
  providers: [EspecialidadesService],
  exports: [EspecialidadesService],
})
export class EspecialidadesModule {}
