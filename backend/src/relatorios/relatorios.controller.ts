import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { RelatoriosService } from './relatorios.service';
@ApiTags('Relatórios')
@ApiBearerAuth()
@Perfis('admin')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}
  @Get('resumo') resumo() {
    return this.service.resumo();
  }
  @Get('consultas-por-status') consultasPorStatus() {
    return this.service.consultasPorStatus();
  }
  @Get('consultas-por-especialidade') consultasPorEspecialidade() {
    return this.service.consultasPorEspecialidade();
  }
}
