import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsInt()
  order?: number;
}