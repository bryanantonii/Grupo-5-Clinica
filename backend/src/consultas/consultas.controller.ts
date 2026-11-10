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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { ConsultasService } from './consultas.service';
import {
  AtualizarConsultaDto,
  CriarConsultaDto,
  ListarConsultasDto,
  MudarStatusDto,
} from './dto/consulta.dto';
@ApiTags('Consultas')
@ApiBearerAuth()
@Controller('consultas')
export class ConsultasController {
  constructor(private readonly service: ConsultasService) {}
  @Get() listar(@Query() query: ListarConsultasDto) {
    return this.service.listar(query);
  }
  @Get(':id') buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }
  @Post() criar(@Body() dto: CriarConsultaDto) {
    return this.service.criar(dto);
  }
  @Patch(':id') atualizar(
    @Param('id') id: string,
    @Body() dto: AtualizarConsultaDto,
  ) {
    return this.service.atualizar(id, dto);
  }
  @Patch(':id/status') mudarStatus(
    @Param('id') id: string,
    @Body() dto: MudarStatusDto,
  ) {
    return this.service.mudarStatus(id, dto.status);
  }
  @Delete(':id')
  @Perfis('admin')
  @HttpCode(204)
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
