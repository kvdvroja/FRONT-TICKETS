export interface FileUploadResponse {
  files: Array<{
    url: string;
    name: string;
    sizeInBytes: number;
    extension: string;
    sequence: string;
    originalName: string; // Nombre original del archivo
  }>;
}
