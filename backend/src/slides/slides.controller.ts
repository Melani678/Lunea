import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SlidesService } from './slides.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { ReorderSlidesDto } from './dto/reorder-slides.dto';

@Controller('slides')
export class SlidesController {
  constructor(private readonly slidesService: SlidesService) {}

  // Pública
  @Get()
  findAll() {
    return this.slidesService.findAll();
  }

  // Solo admin
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateSlideDto) {
    return this.slidesService.create(dto);
  }

  @UseGuards(AuthGuard)
  @Put('reorder')
  reorder(@Body() dto: ReorderSlidesDto) {
    return this.slidesService.reorder(dto.ids);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.slidesService.remove(id);
  }
}