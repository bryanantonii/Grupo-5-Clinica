import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Convenio, ConvenioSchema } from './schemas/convenio.schema';
import { ConveniosService } from './convenios.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Convenio.name, schema: ConvenioSchema },
    ]),
  ],
  providers: [ConveniosService],
  exports: [MongooseModule, ConveniosService],
})
export class ConveniosModule {}
