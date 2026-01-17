import * as React from 'react';
import { useEffect } from 'react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx';
import { IconX } from '@tabler/icons-react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { Spinner } from '@/components/ui/spinner.tsx';

export const PreviewImage = ({
  imageUrl,
  itemId,
  className,
}: {
  imageUrl: string;
  itemId: number | null;
  className: string;
}) => {
  const [isImageError, setIsImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const urlObject = new URL('/content/fetch-image', window.location.origin);
  urlObject.searchParams.set('image-url', encodeURI(imageUrl));

  if (itemId) {
    urlObject.searchParams.set('item-id', String(itemId));
  }
  const imageLocalURL = urlObject.toString();

  useEffect(() => {
    setIsImageError(false);
    setIsLoading(true);
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
        {isLoading && (
          <div
            className={`${className} item__image flex min-h-16 min-w-16 animate-pulse items-center justify-center bg-gray-100`}
          >
            <Spinner className="text-muted-foreground size-6" />
          </div>
        )}
        <DialogTrigger asChild>
          <img
            className={cn(className, 'item__image', isLoading ? 'hidden' : '')}
            src={imageLocalURL}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsImageError(true)}
          />
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
            className={cn('h-auto max-h-[90vh] object-contain', imageUrl.endsWith('.svg') ? 'w-[500px]' : 'w-auto')}
            src={imageLocalURL}
            title={imageUrl}
            alt={'Preview of image: ' + imageUrl}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
