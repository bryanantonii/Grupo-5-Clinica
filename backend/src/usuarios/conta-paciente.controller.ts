import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Perfis } from '../auth/decorators/perfis.decorator';
import type { RequisicaoAutenticada } from '../auth/usuario-logado';
import { AtualizarContaPacienteDto } from './dto/conta-paciente.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Conta do paciente')
@ApiBearerAuth()
@Perfis('paciente')
@Controller('conta')
export class ContaPacienteController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Lê a própria conta do paciente no MongoDB' })
  me(@Req() request: RequisicaoAutenticada) {
    return this.usuarios.buscarContaPaciente(request.usuario.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualiza somente os dados da própria conta' })
  atualizar(
    @Req() request: RequisicaoAutenticada,
    @Body() dto: AtualizarContaPacienteDto,
  ) {
    return this.usuarios.atualizarContaPaciente(request.usuario.sub, dto);
  }
}
