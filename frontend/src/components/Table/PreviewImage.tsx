import * as React from 'react';
import { useEffect } from 'react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IconX } from '@tabler/icons-react';
import { ImageOff, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

export const PreviewImage = ({ imageUrl, className }: { imageUrl: string; className: string }) => {
  const [isImageError, setIsImageError] = React.useState(false);
  useEffect(() => {
    setIsImageError(false);
  }, [imageUrl]);

  if (isImageError) {
    return (
      <div
        className={`${className} text-muted-foreground flex min-h-16 min-w-16 items-center justify-center bg-gray-200`}
        title={`Image link is broken: ${imageUrl}`}
      >
        <ImageOff />
      </div>
    );
  }

  return (
    <div className="group relative w-fit">
      <img className={className} src={imageUrl} onError={() => setIsImageError(true)} />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="absolute right-2 bottom-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 active:opacity-100 any-pointer-coarse:opacity-100"
            size="icon"
          >
            <ZoomIn />
            <span className="sr-only">Enlarge image</span>
          </Button>
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
