import * as React from 'react';
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { IconX } from '@tabler/icons-react';

export const PreviewImage = ({ imageUrl, className }: { imageUrl: string; className: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <img className={className + ' cursor-zoom-in'} src={imageUrl} />
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
          alt={'Preview of image ' + imageUrl}
        />
      </DialogContent>
    </Dialog>
  );
};
