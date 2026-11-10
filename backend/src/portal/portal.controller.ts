import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Publico } from '../auth/decorators/publico.decorator';
import { Perfis } from '../auth/decorators/perfis.decorator';
import type { RequisicaoAutenticada } from '../auth/usuario-logado';
import { AgendarPacienteDto, HorariosDto } from './dto/agendamento.dto';
import { PortalService } from './portal.service';

@ApiTags('Consultas do paciente')
@ApiBearerAuth()
@Perfis('paciente')
@Controller('conta/consultas')
export class PortalController {
  constructor(private readonly portal: PortalService) {}
  @Get()
  @ApiOperation({
    summary: 'Lista somente as consultas do paciente autenticado',
  })
  listar(@Req() req: RequisicaoAutenticada) {
    return this.portal.listar(req.usuario.sub);
  }
  @Get('cadastro')
  @ApiOperation({
    summary: 'Lê os dados clínicos da própria conta para o agendamento',
  })
  cadastro(@Req() req: RequisicaoAutenticada) {
    return this.portal.cadastro(req.usuario.sub);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consulta os detalhes de um agendamento próprio' })
  buscar(@Req() req: RequisicaoAutenticada, @Param('id') id: string) {
    return this.portal.buscar(req.usuario.sub, id);
  }
  @Post()
  @ApiOperation({
    summary:
      'Agenda no MongoDB usando a identidade do JWT, sem aceitar IDs de outro paciente',
  })
  criar(@Req() req: RequisicaoAutenticada, @Body() dto: AgendarPacienteDto) {
    return this.portal.agendar(req.usuario.sub, dto);
  }
  @Patch(':id/cancelar')
  @ApiOperation({
    summary:
      'Cancela uma consulta própria e libera o horário, mantendo o histórico',
  })
  cancelar(@Req() req: RequisicaoAutenticada, @Param('id') id: string) {
    return this.portal.cancelar(req.usuario.sub, id);
  }
}

@Publico()
@ApiTags('Catálogo público')
@Controller('catalogo')
export class AgendaPublicaController {
  constructor(private readonly portal: PortalService) {}
  @Get('horarios')
  @ApiOperation({
    summary: 'Retorna horários disponíveis sem expor os pacientes agendados',
  })
  horarios(@Query() dto: HorariosDto) {
    return this.portal.horarios(dto);
  }
  @Get('convenios')
  @ApiOperation({ summary: 'Lista os convênios ativos aceitos pela clínica' })
  convenios() {
    return this.portal.convenios();
  }
}
