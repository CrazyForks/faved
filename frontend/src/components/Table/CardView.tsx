import * as React from 'react';
import { CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { Button } from '../ui/button';
import { ActionType } from '../dashboard/types';
import { StoreContext } from '@/store/storeContext';
import { TagBadge } from './TagBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { PreviewImage } from '@/components/Table/PreviewImage.tsx';

export const CardView: React.FC<{ el: any }> = observer(({ el }) => {
  const store = React.useContext(StoreContext);

  return (
    <div className="hover-action-container flex h-full flex-col gap-5">
      {el.image && (
        <PreviewImage
          imageUrl={el.image}
          className="-mt-6 aspect-[1.91/1] w-full rounded-tl-[13px] rounded-tr-[13px] object-cover"
        />
      )}
      <CardHeader className="flex-grow">
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hover-action absolute top-2 right-2" size="icon">
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => {
                  store.setType(ActionType.EDIT);
                  store.setIsShowEditModal(true);
                  store.setIdItem(el.id);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  const result = await store.onCreateItem(el);
                  if (!result) {
                    return;
                  }
                  store.fetchItems();
                }}
              >
                Make a copy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="order-1 w-full sm:order-2 sm:w-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="focus:bg-accent focus:text-accent-foreground hover:bg-destructive/90 relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                      Delete
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row">
                      <AlertDialogCancel className="mt-2 sm:mt-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => store.onDeleteItem(el.id)}
                        className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
        <div className="flex w-full flex-col items-start gap-2 text-left wrap-anywhere">
          {el.title && (
            <CardTitle>
              <h4 className="line-clamp-3 scroll-m-20 text-xl font-semibold tracking-tight" title={el.title}>
                {el.title}
              </h4>
            </CardTitle>
          )}
          {el.url && (
            <a
              className="text-custom-blue line-clamp-3 break-all underline"
              href={el.url}
              target="_blank"
              rel="noopener noreferrer"
              title={el.url}
            >
              {el.url}
            </a>
          )}
          {el.tags && (
            <div className="flex w-full flex-wrap gap-1 py-2 leading-6.5">
              {el.tags.map((tagID) => (
                <React.Fragment key={tagID.toString()}>
                  <TagBadge tagID={tagID} />
                </React.Fragment>
              ))}
            </div>
          )}
          {(el.description || el.comments) && (
            <CardDescription>
              {el.description && (
                <div>
                  <p className="leading-7 whitespace-pre-line [&:not(:first-child)]:mt-6">{el.description}</p>
                </div>
              )}
              {el.comments && (
                <div>
                  <blockquote className="mt-6 border-l-2 pl-6 whitespace-pre-line italic">{el.comments}</blockquote>
                </div>
              )}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardFooter className="text-left">
        <div>
          <p className="text-muted-foreground text-sm">
            <small className="text-sm leading-none font-medium">Created at:</small> {el.created_at}
          </p>
        </div>
      </CardFooter>
    </div>
  );
});
