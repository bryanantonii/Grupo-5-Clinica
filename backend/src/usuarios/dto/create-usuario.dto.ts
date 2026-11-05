import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MinLength,
  ValidateBy,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Ana Lima', minLength: 3, maxLength: 80 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(3, 80)
  nome: string;

  @ApiProperty({ example: 'ana@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 72,
    writeOnly: true,
    description:
      'Senha com pelo menos oito caracteres e até 72 bytes em UTF-8.',
  })
  @IsString()
  @MinLength(8)
  @ValidateBy({
    name: 'limiteBcrypt',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 72,
      defaultMessage: () => 'A senha deve ter no máximo 72 bytes em UTF-8.',
    },
  })
  senha: string;

  @ApiPropertyOptional({
    enum: ['atendente'],
    default: 'atendente',
    description: 'O administrador inicial é criado somente pelo seed.',
  })
  @IsOptional()
  @IsIn(['atendente'])
  perfil?: 'atendente';
}
