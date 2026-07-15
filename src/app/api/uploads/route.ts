import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files were provided.' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const uploadedFiles: Array<{ name: string; url: string; type: string }> = [];

    for (const file of files) {
      if (!file || typeof file.name !== 'string') continue;

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const timestamp = Date.now();
      const filePath = path.join(uploadsDir, `${timestamp}-${safeName}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      uploadedFiles.push({
        name: safeName,
        url: `/uploads/${path.basename(filePath)}`,
        type: file.type || 'application/octet-stream',
      });
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
