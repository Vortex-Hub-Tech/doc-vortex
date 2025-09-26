// This file handles Supabase Storage integration for image uploads
// Since we're using Drizzle directly for database, this focuses on Storage only

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export class SupabaseStorage {
  private baseUrl: string;
  private anonKey: string;

  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.anonKey = SUPABASE_ANON_KEY;
  }

  async uploadFile(bucket: string, path: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${this.baseUrl}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao fazer upload: ${response.statusText}`);
    }

    return `${this.baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/storage/v1/object/${bucket}/${path}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Erro ao deletar arquivo: ${response.statusText}`);
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    return `${this.baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }
}

export const supabaseStorage = new SupabaseStorage();
