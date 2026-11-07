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
import { EspecialidadesService } from './especialidades.service';
import {
  CriarEspecialidadeDto,
  AtualizarEspecialidadeDto,
} from './dto/especialidade.dto';
@ApiTags('Especialidades')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'JWT obrigatório' })
@ApiForbiddenResponse({ description: 'Somente administradores podem excluir' })
@Controller('especialidades')
export class EspecialidadesController {
  constructor(private readonly service: EspecialidadesService) {}
  @Get() listar(@Query() query: ListagemDto) {
    return this.service.listar(query);
  }
  @Get(':id') buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }
  @Post() criar(@Body() dto: CriarEspecialidadeDto) {
    return this.service.criar(dto);
  }
  @Patch(':id') atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarEspecialidadeDto,
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
