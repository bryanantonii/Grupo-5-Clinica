import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProdutoDto } from './create-produto.dto';

// PartialType: todos os campos do Create viram opcionais na atualização
export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
