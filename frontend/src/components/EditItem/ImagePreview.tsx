import { Image } from 'lucide-react';
import React from 'react';
import { PreviewImage } from '@/components/Table/Fields/PreviewImage.tsx';

export const ImagePreview = ({ imageUrl }: { imageUrl: string }) => (
  <>
    {imageUrl ? (
      <PreviewImage imageUrl={imageUrl} className="max-h-[100px] w-auto rounded-sm object-contain shadow-sm" />
    ) : (
      <div
        className="text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
        title="No image"
      >
        <Image />
      </div>
    )}
  </>
);
