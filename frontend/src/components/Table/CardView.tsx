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
    <div className="flex flex-col gap-5 h-full hover-action-container ">
      {el.image && (
        <PreviewImage
          imageUrl={el.image}
          className="w-full aspect-[1.91/1] -mt-6 rounded-tl-[13px] rounded-tr-[13px] object-cover"
        />
      )}
      <CardHeader className="flex-grow">
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="absolute top-2 right-2 hover-action" size="icon">
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
              <div className="order-1 sm:order-2 w-full sm:w-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-destructive/90 hover:text-white">
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
                        className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
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
        <div className="flex flex-col items-start w-full text-left wrap-anywhere gap-2">
          {el.title && (
            <CardTitle>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight line-clamp-3" title={el.title}>
                {el.title}
              </h4>
            </CardTitle>
          )}
          {el.url && (
            <a
              className="text-custom-blue underline break-all line-clamp-3"
              href={el.url}
              target="_blank"
              rel="noopener noreferrer"
              title={el.url}
            >
              {el.url}
            </a>
          )}
          {el.tags && (
            <div className="w-full py-2 leading-6.5 flex flex-wrap gap-1">
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
                  <p className="leading-7 [&:not(:first-child)]:mt-6 whitespace-pre-line">{el.description}</p>
                </div>
              )}
              {el.comments && (
                <div>
                  <blockquote className="mt-6 border-l-2 pl-6 italic whitespace-pre-line">{el.comments}</blockquote>
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
