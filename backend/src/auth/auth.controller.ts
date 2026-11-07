import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Publico } from './decorators/publico.decorator';
import { LoginDto } from './dto/login.dto';
import type { RequisicaoAutenticada } from './usuario-logado';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CadastroPacienteDto } from '../usuarios/dto/conta-paciente.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usuarios: UsuariosService,
  ) {}

  @Publico()
  @Post('cadastro-paciente')
  @ApiOperation({
    summary:
      'Cria uma conta pública com perfil fixo de paciente e inicia a sessão',
  })
  async cadastrarPaciente(@Body() dto: CadastroPacienteDto) {
    await this.usuarios.criarPaciente(dto);
    return this.auth.login(dto.email, dto.senha, 'paciente');
  }

  @Publico()
  @Post('login-paciente')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica uma conta de paciente' })
  loginPaciente(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.senha, 'paciente');
  }

  @Publico()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autentica por e-mail e senha e emite um JWT válido por uma hora',
  })
  @ApiOkResponse({
    description: 'accessToken e dados públicos do usuário, dentro de dados.',
  })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.senha);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confere a identidade do token enviado' })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, malformado, inválido ou expirado',
  })
  me(@Req() request: RequisicaoAutenticada) {
    return request.usuario;
  }
}
