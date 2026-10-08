// Forma mínima del archivo que entrega Multer (guardado en memoria)
export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}