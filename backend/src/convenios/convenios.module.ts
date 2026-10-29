import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Convenio, ConvenioSchema } from './schemas/convenio.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Convenio.name, schema: ConvenioSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ConveniosModule {}
