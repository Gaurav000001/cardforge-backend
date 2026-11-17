export interface UploadFileInput {
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  fileExtension: string;
}

export interface UploadFileResult {
  path: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageService {
  upload(input: UploadFileInput): Promise<UploadFileResult>;
  delete(path: string): Promise<void>;
}
