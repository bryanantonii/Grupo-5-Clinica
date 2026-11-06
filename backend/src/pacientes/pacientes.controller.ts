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
import { PacientesService } from './pacientes.service';
import { CriarPacienteDto, AtualizarPacienteDto } from './dto/paciente.dto';
@ApiTags('Pacientes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'JWT obrigatório' })
@ApiForbiddenResponse({ description: 'Somente administradores podem excluir' })
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly service: PacientesService) {}
  @Get() listar(@Query() query: ListagemDto) {
    return this.service.listar(query);
  }
  @Get(':id') buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }
  @Post() criar(@Body() dto: CriarPacienteDto) {
    return this.service.criar(dto);
  }
  @Patch(':id') atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarPacienteDto,
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
