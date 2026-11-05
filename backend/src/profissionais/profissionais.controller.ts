import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProfissionalDto } from './dto/create-profissional.dto';
import { UpdateProfissionalDto } from './dto/update-profissional.dto';
import { ListarProfissionaisDto } from './dto/listar-profissionais.dto';
import {
  EspecialidadesEnvelopeDto,
  ProfissionalEnvelopeDto,
  ProfissionaisEnvelopeDto,
} from './dto/profissional-resposta.dto';
import { ProfissionaisService } from './profissionais.service';

@ApiTags('Profissionais')
@ApiBadRequestResponse({
  description:
    'ID, filtros ou dados inválidos; campos desconhecidos são rejeitados',
})
@Controller('profissionais')
export class ProfissionaisController {
  constructor(private readonly service: ProfissionaisService) {}

  @Get()
  @ApiOperation({
    summary:
      'Lista profissionais ativos com busca por nome e filtro por especialidade',
  })
  @ApiOkResponse({ type: ProfissionaisEnvelopeDto })
  listar(@Query() query: ListarProfissionaisDto) {
    return this.service.listar(query);
  }

  @Get('opcoes/especialidades')
  @ApiOperation({
    summary: 'Consulta as especialidades disponíveis para o formulário',
  })
  @ApiOkResponse({ type: EspecialidadesEnvelopeDto })
  listarEspecialidades() {
    return this.service.listarEspecialidades();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca um profissional por ID, incluindo os inativos',
  })
  @ApiParam({ name: 'id', example: '665f1c2b9a1e4b0012345680' })
  @ApiOkResponse({ type: ProfissionalEnvelopeDto })
  @ApiNotFoundResponse({ description: 'Profissional não encontrado' })
  buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastra um profissional ativo' })
  @ApiCreatedResponse({ type: ProfissionalEnvelopeDto })
  @ApiNotFoundResponse({ description: 'Especialidade não encontrada' })
  @ApiConflictResponse({ description: 'Registro ou e-mail já cadastrado' })
  criar(@Body() dto: CreateProfissionalDto) {
    return this.service.criar(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita os campos informados de um profissional' })
  @ApiParam({ name: 'id', example: '665f1c2b9a1e4b0012345680' })
  @ApiOkResponse({ type: ProfissionalEnvelopeDto })
  @ApiNotFoundResponse({
    description: 'Profissional ou especialidade não encontrado',
  })
  @ApiConflictResponse({ description: 'Registro ou e-mail já cadastrado' })
  atualizar(@Param('id') id: string, @Body() dto: UpdateProfissionalDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Inativa um profissional sem apagar o registro' })
  @ApiParam({ name: 'id', example: '665f1c2b9a1e4b0012345680' })
  @ApiNoContentResponse({
    description: 'Profissional inativado; sem corpo de resposta',
  })
  @ApiNotFoundResponse({ description: 'Profissional não encontrado' })
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
