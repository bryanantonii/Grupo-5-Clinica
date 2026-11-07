import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { ListagemDto } from '../cadastros/listagem.dto';
import { ConveniosService } from './convenios.service';
import { CriarConvenioDto, AtualizarConvenioDto } from './dto/convenio.dto';
@ApiTags('Convenios')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'JWT obrigatório' })
@ApiForbiddenResponse({ description: 'Somente administradores podem excluir' })
@Controller('convenios')
export class ConveniosController {
  constructor(private readonly service: ConveniosService) {}
  @Get() listar(@Query() query: ListagemDto) {
    return this.service.listar(query.busca, query.todos);
  }
  @Get(':id') buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }
  @Post() criar(@Body() dto: CriarConvenioDto) {
    return this.service.criar(dto);
  }
  @Patch(':id') atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarConvenioDto,
  ) {
    return this.service.atualizar(id, dto);
  }
  @Delete(':id')
  @Perfis('admin')
  @HttpCode(204)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
