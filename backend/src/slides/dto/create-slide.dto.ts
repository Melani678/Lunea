import { IsUrl } from 'class-validator';

export class CreateSlideDto {
  @IsUrl()
  imageUrl: string;
}