import React from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { IconDotsVertical } from '@tabler/icons-react';
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
} from '@/components/ui/alert-dialog.tsx';

import { ActionType } from '@/lib/types.ts';

export const ItemsActions = ({ row }) => {
  const itemId = row.original.id;
  const store = React.useContext(StoreContext);
  const handleEdit = () => {
    store.setType(ActionType.EDIT);
    store.setIsShowEditModal(true);
    store.setIdItem(itemId);
  };

  const handleMakeCopy = async () => {
    const result = await store.onCreateItem(row.original);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  const handleDelete = () => {
    store.onDeleteItem(itemId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hover-action" size="icon">
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleMakeCopy}>Make a copy</DropdownMenuItem>
        <DropdownMenuSeparator />
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
                This action cannot be undone. The item will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 order-first mt-2 w-full text-white shadow-xs sm:order-last sm:mt-0 sm:w-auto"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
