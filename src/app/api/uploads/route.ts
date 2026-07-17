import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files were provided.' }, { status: 400 });
    }

    const uploadedFiles: Array<{ name: string; url: string; type: string }> = [];

    for (const file of files) {
      if (!file || typeof file.name !== 'string') continue;

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = file.type || 'application/octet-stream';

      let uploadedUrl = '';

      // 1. Try Supabase Storage first (for production / cloud environments)
      try {
        const bucketName = 'media';
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(uniqueName, buffer, {
            contentType: fileType,
            duplex: 'half'
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uniqueName);

        uploadedUrl = publicUrlData.publicUrl;
      } catch (storageError: any) {
        console.error('Supabase storage upload failed:', storageError);
        
        // If we are in production / Vercel serverless, do NOT fall back to local (it will fail anyway)
        const isServerless = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
        if (isServerless) {
          let friendlyMessage = `Supabase Storage upload failed: ${storageError?.message || 'Unknown error'}.`;
          
          if (storageError?.statusCode === '404' || storageError?.message?.includes('not found') || storageError?.message?.includes('bucket')) {
            friendlyMessage = "Supabase Storage bucket 'media' was not found. Please log in to your Supabase Console, navigate to Storage, create a new public bucket named 'media', and set its access policies to allow anonymous/public uploads.";
          } else if (storageError?.statusCode === '403' || storageError?.message?.includes('policy') || storageError?.message?.includes('Permission') || storageError?.message?.includes('row-level security')) {
            friendlyMessage = "Supabase Storage permission denied. Please go to your Supabase Console, select the 'media' bucket, and add an upload policy allowing public anonymous/public uploads.";
          }
          
          return NextResponse.json({ error: friendlyMessage }, { status: 500 });
        }

        console.warn('Falling back to local storage (local development)...');
        
        // 2. Fallback to local storage (for local development)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });
        
        const filePath = path.join(uploadsDir, uniqueName);
        await writeFile(filePath, buffer);
        uploadedUrl = `/uploads/${uniqueName}`;
      }

      uploadedFiles.push({
        name: safeName,
        url: uploadedUrl,
        type: fileType,
      });
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
