import * as React from 'react';
import { useEffect } from 'react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx';
import { IconX } from '@tabler/icons-react';
import { ImageOff } from 'lucide-react';

export const PreviewImage = ({ imageUrl, className }: { imageUrl: string; className: string }) => {
  const [isImageError, setIsImageError] = React.useState(false);
  useEffect(() => {
    setIsImageError(false);
  }, [imageUrl]);

  if (isImageError) {
    return (
      <div className="item__image-container">
        <div
          className={`${className} text-muted-foreground item__image flex min-h-16 min-w-16 items-center justify-center bg-gray-200`}
          title={`Image link is broken: ${imageUrl}`}
        >
          <ImageOff />
        </div>
      </div>
    );
  }

  return (
    <div className="group item__image-container relative">
      <Dialog>
        <DialogTrigger asChild>
          <img className={className + ' item__image'} src={imageUrl} onError={() => setIsImageError(true)} />
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className="w-max border-0 bg-transparent p-0 shadow-none"
        >
          <DialogTitle className="hidden">Image Preview</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="bg-background hover:bg-accent absolute -top-4 -right-4 rounded-full p-2 shadow transition"
              aria-label="Close"
            >
              <IconX size={20} />
            </button>
          </DialogClose>
          <img
            className="h-auto max-h-[90vh] w-auto object-contain"
            src={imageUrl}
            title={imageUrl}
            alt={'Preview of image: ' + imageUrl}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
