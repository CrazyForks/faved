import React from 'react';
import { StoreContext } from '@/store/storeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { IconDotsVertical } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { ActionType } from '../dashboard/types';
import { Button } from '@/components/ui/button';
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
import { TagBadge } from './TagBadge';
import { PreviewImage } from '@/components/Table/PreviewImage.tsx';

export const schema = z.object({
  id: z.number(),
  url: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  title: z.string(),
  image: z.string(),
  tags: z.array(z.number()),
  comments: z.string(),
});

const UrlCellContent = observer(({ item }: { item: z.infer<typeof schema> }) => {
  const { url, title, tags, created_at } = item;

  return (
    <div className="flex w-full flex-col items-start gap-2 text-left wrap-anywhere">
      {title && (
        <h4 className="line-clamp-3 scroll-m-20 text-xl font-semibold tracking-tight" title={title}>
          {title}
        </h4>
      )}
      {url && (
        <a
          className="text-custom-blue line-clamp-3 break-all underline"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
      )}
      {tags && (
        <div className="flex w-full flex-wrap gap-1 py-2 leading-6.5">
          {tags.map((tagID) => (
            <TagBadge key={tagID} tagID={tagID} />
          ))}
        </div>
      )}
      <div className="text-muted-foreground mt-auto text-sm">
        <small className="text-sm leading-none font-medium">Created at:</small> {created_at}
      </div>
    </div>
  );
});

const DescriptionCellContent = ({ item }: { item: z.infer<typeof schema> }) => {
  const { comments, image, description } = item;

  return (
    <div className="flex w-full max-w-full flex-col items-start text-left">
      {image && <PreviewImage imageUrl={image} className="h-auto max-h-[200px] w-auto rounded-sm" />}
      {description && (
        <p className="max-w-full leading-7 break-words whitespace-pre-line [&:not(:first-child)]:mt-6">{description}</p>
      )}
      {comments && (
        <blockquote className="mt-6 max-w-full border-l-2 pl-6 break-words whitespace-pre-line italic">
          {comments}
        </blockquote>
      )}
    </div>
  );
};

const ActionsCell = observer(({ row }: { row: any }) => {
  const store = React.useContext(StoreContext);
  const handleEdit = () => {
    store.setType(ActionType.EDIT);
    store.setIsShowEditModal(true);
    store.setIdItem(row.getValue('id'));
  };

  const handleMakeCopy = async () => {
    const result = await store.onCreateItem(row.original);
    if (!result) {
      return;
    }
    store.fetchItems();
  };

  const handleDelete = () => {
    store.onDeleteItem(row.getValue('id'));
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
                This action cannot be undone. This will permanently delete your item.
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
});

export const createColumns = (): ColumnDef<z.infer<typeof schema>>[] => [
  {
    accessorKey: 'title',
    header: 'Title',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'url',
    header: 'Url',
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => <UrlCellContent item={row.original} />,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => <DescriptionCellContent item={row.original} />,
  },
  {
    accessorKey: 'comments',
    header: 'Comments',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'created_at',
    header: 'Created at',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated at',
    enableSorting: true,
    enableHiding: true,
  },

  {
    header: '',
    accessorKey: 'id',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

export const getTableViewPreference = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = sessionStorage.getItem('isTableView');
    return stored !== null ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
};

export const setTableViewPreference = (value: boolean): void => {
  try {
    sessionStorage.setItem('isTableView', JSON.stringify(value));
  } catch {
    // Ignore storage errors - failing silently is acceptable for preferences
  }
};
