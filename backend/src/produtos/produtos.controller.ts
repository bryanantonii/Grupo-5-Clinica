import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ProdutosService } from './produtos.service';
import { CATEGORIAS, type Categoria } from './schemas/produto.schema';

/**
 * O Controller recebe a requisição, extrai os dados e delega ao Service.
 * Nada de regra de negócio aqui (aula 09, slides 3 e 5).
 */
@ApiTags('Produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os produtos' })
  @ApiQuery({ name: 'categoria', required: false, enum: CATEGORIAS })
  @ApiResponse({ status: 200, description: 'Lista de produtos retornada' })
  listar(@Query('categoria') categoria?: Categoria) {
    return this.produtosService.listar(categoria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto pelo id' })
  @ApiResponse({ status: 200, description: 'Produto encontrado' })
  @ApiResponse({ status: 400, description: 'Id inválido' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  buscarPorId(@Param('id') id: string) {
    return this.produtosService.buscarPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra um produto' })
  @ApiResponse({ status: 201, description: 'Produto criado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Nome já cadastrado' })
  criar(@Body() dto: CreateProdutoDto) {
    return this.produtosService.criar(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um produto' })
  @ApiResponse({ status: 200, description: 'Produto atualizado' })
  @ApiResponse({ status: 400, description: 'Dados ou id inválidos' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  atualizar(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Exclui um produto (somente com estoque zerado)' })
  @ApiResponse({ status: 204, description: 'Produto excluído' })
  @ApiResponse({ status: 400, description: 'Id inválido ou com estoque' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  remover(@Param('id') id: string) {
    return this.produtosService.remover(id);
  }
}
