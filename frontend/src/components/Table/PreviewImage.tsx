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
        className={`${className} flex items-center justify-center text-muted-foreground bg-gray-200 min-w-16 min-h-16`}
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
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 any-pointer-coarse:opacity-100 active:opacity-100 transition-opacity duration-200"
            size="icon"
          >
            <ZoomIn />
            <span className="sr-only">Enlarge image</span>
          </Button>
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className="w-max p-0 shadow-none bg-transparent border-0"
        >
          <DialogTitle className="hidden">Image Preview</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="absolute -top-4 -right-4 bg-background hover:bg-accent rounded-full shadow p-2  transition"
              aria-label="Close"
            >
              <IconX size={20} />
            </button>
          </DialogClose>
          <img
            className="w-auto h-auto max-h-[90vh] object-contain"
            src={imageUrl}
            title={imageUrl}
            alt={'Preview of image: ' + imageUrl}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
