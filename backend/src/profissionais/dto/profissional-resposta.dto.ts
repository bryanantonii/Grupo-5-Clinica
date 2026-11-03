import { ApiProperty } from '@nestjs/swagger';

export class EspecialidadeOpcaoDto {
  @ApiProperty({ example: '665f1c2b9a1e4b0012345678' })
  _id: string;

  @ApiProperty({ example: 'Clínica geral' })
  nome: string;
}

export class ProfissionalRespostaDto {
  @ApiProperty({ example: '665f1c2b9a1e4b0012345680' })
  _id: string;
  @ApiProperty({ example: 'Dra. Ana Lima' })
  nome: string;
  @ApiProperty({ example: 'CRM-RS 45678' })
  registro: string;
  @ApiProperty({ type: EspecialidadeOpcaoDto })
  especialidade: EspecialidadeOpcaoDto;
  @ApiProperty({ example: 'ana.lima@example.com' })
  email: string;
  @ApiProperty({ example: '(51) 99876-5432' })
  telefone: string;
  @ApiProperty({ example: true })
  ativo: boolean;
  @ApiProperty({ example: '2026-11-03T18:00:00.000Z', required: false })
  createdAt?: string;
  @ApiProperty({ example: '2026-11-03T18:00:00.000Z', required: false })
  updatedAt?: string;
}

export class ProfissionalEnvelopeDto {
  @ApiProperty({ example: true })
  sucesso: true;
  @ApiProperty({ type: ProfissionalRespostaDto })
  dados: ProfissionalRespostaDto;
}

export class ProfissionaisEnvelopeDto {
  @ApiProperty({ example: true })
  sucesso: true;
  @ApiProperty({ type: [ProfissionalRespostaDto] })
  dados: ProfissionalRespostaDto[];
}

export class EspecialidadesEnvelopeDto {
  @ApiProperty({ example: true })
  sucesso: true;
  @ApiProperty({ type: [EspecialidadeOpcaoDto] })
  dados: EspecialidadeOpcaoDto[];
}
