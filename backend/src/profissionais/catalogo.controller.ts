import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Publico } from '../auth/decorators/publico.decorator';
import { ProfissionaisService } from './profissionais.service';

/** Somente os dados de apresentação do site; operações de gestão exigem JWT. */
@Publico()
@ApiTags('Catálogo público')
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly profissionais: ProfissionaisService) {}

  @Get('profissionais')
  @ApiOperation({
    summary:
      'Lista a equipe pública sem dados de contato ou operações de escrita',
  })
  async listarEquipe() {
    const lista = await this.profissionais.listar();
    return lista.map((p) => ({
      _id: p._id,
      nome: p.nome,
      registro: p.registro,
      especialidade: p.especialidade._id,
      nomeEspecialidade: p.especialidade.nome,
      ativo: p.ativo,
    }));
  }

  @Get('especialidades')
  @ApiOperation({
    summary: 'Lista as especialidades disponíveis para apresentação no site',
  })
  listarEspecialidades() {
    return this.profissionais.listarEspecialidades();
  }
}
