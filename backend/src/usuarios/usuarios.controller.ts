import { Body, Controller, Get, Post, Req } from '@nestjs/common';
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

  @Get('me')
  @ApiOperation({
    summary: 'Consulta o próprio cadastro sem devolver a senha ou o hash',
  })
  me(@Req() request: RequisicaoAutenticada) {
    return this.usuarios.buscarPorId(request.usuario.sub);
  }
}
