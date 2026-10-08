import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  // Públicas
  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.sectionsService.findBySlug(slug);
  }

  // Solo admin
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateSectionDto) {
    return this.sectionsService.create(dto);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(id, dto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.remove(id);
  }
}