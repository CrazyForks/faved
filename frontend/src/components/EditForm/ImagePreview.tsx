import { Image } from 'lucide-react';
import React from 'react';
import { PreviewImage } from '@/components/Table/PreviewImage.tsx';

export const ImagePreview = ({ imageUrl }: { imageUrl: string }) => (
  <>
    {imageUrl ? (
      <PreviewImage imageUrl={imageUrl} className="w-auto max-h-[100px] object-contain rounded-sm shadow-sm" />
    ) : (
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full text-muted-foreground bg-gray-200"
        title="No image"
      >
        <Image />
      </div>
    )}
  </>
);
