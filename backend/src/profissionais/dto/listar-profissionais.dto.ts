import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class ListarProfissionaisDto {
  @ApiPropertyOptional({
    description: 'Parte do nome, sem diferenciar maiúsculas',
    example: 'Ana',
  })
  @ValidateIf((_objeto, valor: unknown) => valor !== undefined)
  @IsString()
  @MaxLength(80)
  busca?: string;

  @ApiPropertyOptional({
    description: 'ID da especialidade',
    example: '665f1c2b9a1e4b0012345678',
  })
  @ValidateIf((_objeto, valor: unknown) => valor !== undefined)
  @IsMongoId({ message: 'Especialidade: id inválido' })
  especialidade?: string;

  @ApiPropertyOptional({
    type: Boolean,
    default: false,
    description: 'Inclui os profissionais inativos',
  })
  @ValidateIf((_objeto, valor: unknown) => valor !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'O parâmetro todos deve ser true ou false' })
  todos?: boolean;
}
