'use client';

import { useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { QRLoader } from '@/components/ui/qr-loader';

interface LogoUploadProps {
  restaurantId: string;
  currentLogoUrl: string | null;
  onUploadComplete: (url: string) => void;
  primaryColor?: string;
}

export function LogoUpload({
  restaurantId,
  currentLogoUrl,
  onUploadComplete,
  primaryColor = '#10b981',
}: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    // Validation côté client
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG, WebP ou SVG.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Maximum 5MB.');
      return;
    }

    // Prévisualisation locale
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurantId', restaurantId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      setPreviewUrl(data.url);
      onUploadComplete(data.url);
      toast.success('Logo uploadé avec succès !');
    } catch (error) {
      console.error('Upload error:', error);
      setPreviewUrl(currentLogoUrl);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, [restaurantId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemoveLogo = async () => {
    setPreviewUrl(null);
    // Optionnel: mettre à jour en DB pour supprimer le logo
    // Pour l'instant on ne fait que vider l'affichage
  };

  return (
    <div className="space-y-4">
      {/* Zone de prévisualisation */}
      {previewUrl && (
        <div className="relative inline-block">
          <div
            className="w-32 h-32 rounded-xl border-2 overflow-hidden bg-white shadow-sm"
            style={{ borderColor: primaryColor }}
          >
            <img
              src={previewUrl}
              alt="Logo du restaurant"
              className="w-full h-full object-contain p-2"
            />
          </div>
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-card/80 rounded-xl flex items-center justify-center">
              <QRLoader size={32} style={{ color: primaryColor }} />
            </div>
          )}
        </div>
      )}

      {/* Zone de drop */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-muted-foreground/40 hover:bg-accent',
          isUploading && 'pointer-events-none opacity-60'
        )}
        style={{
          borderColor: isDragging ? primaryColor : undefined,
          backgroundColor: isDragging ? `${primaryColor}10` : undefined,
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="sr-only"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3 text-center p-4">
          {isUploading ? (
            <>
              <QRLoader size={40} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Upload en cours...</p>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                {isDragging ? (
                  <ImageIcon className="w-6 h-6" style={{ color: primaryColor }} />
                ) : (
                  <Upload className="w-6 h-6" style={{ color: primaryColor }} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? 'Déposez votre logo ici' : 'Glissez-déposez votre logo'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou cliquez pour sélectionner
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP ou SVG • Max 5MB
              </p>
            </>
          )}
        </div>
      </label>
    </div>
  );
}
