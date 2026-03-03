import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    // Vérifier la configuration Cloudinary
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary non configuré' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const restaurantId = formData.get('restaurantId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId requis' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou SVG.' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 5MB.' },
        { status: 400 }
      );
    }

    // Convertir le fichier en base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload vers Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', dataUri);
    cloudinaryFormData.append('upload_preset', 'qr-fidelite');
    cloudinaryFormData.append('folder', 'qr-fidelite/logos');

    // Générer la signature pour l'upload authentifié
    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha256')
      .update(`folder=qr-fidelite/logos&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
      .digest('hex');

    // Upload authentifié
    const uploadFormData = new FormData();
    uploadFormData.append('file', dataUri);
    uploadFormData.append('folder', 'qr-fidelite/logos');
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('api_key', CLOUDINARY_API_KEY);
    uploadFormData.append('signature', signature);

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text();
      console.error('Cloudinary error:', errorText);
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload vers Cloudinary' },
        { status: 500 }
      );
    }

    const cloudinaryData: CloudinaryResponse = await cloudinaryResponse.json();

    // Mettre à jour le logo_url dans la base de données
    // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
    const { error: updateError } = await (supabaseAdmin.from('restaurants') as any)
      .update({ logo_url: cloudinaryData.secure_url })
      .eq('id', restaurantId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour en base de données' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
