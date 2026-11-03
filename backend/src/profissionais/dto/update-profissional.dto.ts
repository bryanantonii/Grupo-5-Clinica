import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, ValidateIf } from 'class-validator';
import { CreateProfissionalDto } from './create-profissional.dto';

export class UpdateProfissionalDto extends PartialType(CreateProfissionalDto, {
  skipNullProperties: false,
}) {
  @ApiPropertyOptional({
    example: true,
    description: 'false inativa; true reativa o profissional',
  })
  @ValidateIf((_objeto, valor: unknown) => valor !== undefined)
  @IsBoolean({ message: 'Ativo deve ser verdadeiro ou falso' })
  ativo?: boolean;
}
