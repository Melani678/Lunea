import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class ReorderSlidesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}