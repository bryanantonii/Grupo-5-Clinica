import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { Produto, ProdutoSchema } from './schemas/produto.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Produto.name, schema: ProdutoSchema }]),
  ],
  controllers: [ProdutosController],
  providers: [ProdutosService],
  exports: [ProdutosService],
})
export class ProdutosModule {}
