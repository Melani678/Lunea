import {
  Controller,
  Get,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Solo admin: GET /api/catalog/pdf  (opcional: ?sectionId=3)
  @UseGuards(AuthGuard)
  @Get('pdf')
  async pdf(@Query('sectionId') sectionId?: string) {
    const id = Number(sectionId);
    const buffer = await this.catalogService.generatePdf(
      Number.isInteger(id) && id > 0 ? id : undefined,
    );

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'attachment; filename="catalogo.pdf"',
    });
  }
}