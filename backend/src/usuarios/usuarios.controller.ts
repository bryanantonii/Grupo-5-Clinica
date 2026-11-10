import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Body, Controller, Get, Post, Req, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { RequisicaoAutenticada } from '../auth/usuario-logado';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuariosService } from './usuarios.service';

export class VincularPacienteDto {
  @ApiProperty() @IsMongoId() paciente: string;
}

@ApiTags('Usuários')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'JWT obrigatório' })
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Post()
  @Perfis('admin')
  @ApiOperation({ summary: 'Cadastra um atendente mediante autenticação' })
  @ApiConflictResponse({ description: 'E-mail já cadastrado' })
  criar(@Body() dto: CreateUsuarioDto) {
    return this.usuarios.criar(dto);
  }

  @Get()
  @Perfis('admin')
  @ApiOperation({ summary: 'Lista as contas sem senhas, hashes ou tokens' })
  listar() {
    return this.usuarios.listar();
  }

  @Patch(':id/paciente')
  @Perfis('admin')
  @ApiOperation({
    summary:
      'Vincula um cadastro clínico após conferência de identidade pela administração',
  })
  vincular(@Param('id') id: string, @Body() dto: VincularPacienteDto) {
    return this.usuarios.vincularPaciente(id, dto.paciente);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Consulta o próprio cadastro sem devolver a senha ou o hash',
  })
  me(@Req() request: RequisicaoAutenticada) {
    return this.usuarios.buscarPorId(request.usuario.sub);
  }
}
