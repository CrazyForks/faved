import React from "react"
import {StoreContext} from "@/store/storeContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {z} from "zod"
import {type ColumnDef} from "@tanstack/react-table"
import {IconDotsVertical} from "@tabler/icons-react"
import {observer} from "mobx-react-lite"
import {ActionType} from "../dashboard/types"
import {Button} from "@/components/ui/button"
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
} from "../ui/alert-dialog"
import {TagBadge} from "./TagBadge"
import {PreviewImage} from "@/components/Table/PreviewImage.tsx";


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
})

const UrlCellContent = observer(({item}: { item: z.infer<typeof schema> }) => {
  const {url, title, tags, updated_at, created_at} = item

  return (
    <div className="flex flex-col items-start w-full text-left wrap-anywhere gap-2">
      {title &&
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight line-clamp-3" title={title}>
            {title}
          </h4>
      }
      {url &&
          <a className="text-custom-blue underline line-clamp-3 break-all" href={url} target="_blank"
             rel="noopener noreferrer">
            {url}
          </a>
      }
      {tags && <div className="text-left w-full py-2 leading-6.5">
        {tags.map((tagID) => (
          <TagBadge key={tagID} tagID={tagID}/>
        ))}
      </div>}
      <div className="text-muted-foreground text-sm mt-auto">
        <small className="text-sm leading-none font-medium">Created at:</small> {created_at}
      </div>
    </div>
  )
})

const DescriptionCellContent = ({item}: { item: z.infer<typeof schema> }) => {
  const {comments, image, description} = item

  return (
    <div className="flex flex-col items-start text-left w-full max-w-full">
      {image && (<PreviewImage
        imageUrl={image}
        className="w-auto h-auto max-h-[200px] rounded-sm"
      />)
      }
      {description && (
        <p className="leading-7 [&:not(:first-child)]:mt-6 whitespace-pre-line break-words max-w-full">
          {description}
        </p>
      )}
      {comments && (
        <blockquote className="mt-6 border-l-2 pl-6 italic whitespace-pre-line break-words max-w-full">
          {comments}
        </blockquote>
      )}
    </div>
  )
}

const ActionsCell = observer(({row}: { row: any }) => {
  const store = React.useContext(StoreContext)
  const handleEdit = () => {
    store.setType(ActionType.EDIT)
    store.setIsShowEditModal(true)
    store.setIdItem(row.getValue("id"))
  }

  const handleMakeCopy = () => {
    store.onCreateItem(row.original, true)
  }

  const handleDelete = () => {
    store.onDeleteItem(row.getValue("id"))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="hover-action"
          size="icon"
        >
          <IconDotsVertical/>
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleMakeCopy}>Make a copy</DropdownMenuItem>
        <DropdownMenuSeparator/>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-destructive/90 hover:text-white"
            >
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
                className="w-full sm:w-auto order-first sm:order-last mt-2 sm:mt-0 bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

export const createColumns = (): ColumnDef<z.infer<typeof schema>>[] => [
  {
    accessorKey: "title",
    header: 'Title',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "url",
    header: 'Url',
    enableSorting: true,
    enableHiding: false,
    cell: ({row}) => <UrlCellContent item={row.original}/>,
  },
  {
    accessorKey: "description",
    header: 'Description',
    enableSorting: true,
    enableHiding: false,
    cell: ({row}) => <DescriptionCellContent item={row.original}/>,
  },
  {
    accessorKey: "comments",
    header: 'Comments',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "created_at",
    header: 'Created at',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "updated_at",
    header: 'Updated at',
    enableSorting: true,
    enableHiding: true,
  },

  {
    header: "",
    accessorKey: "id",
    enableHiding: false,
    cell: ({row}) => (
      <ActionsCell
        row={row}
      />
    ),
  },
]

export const getTableViewPreference = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const stored = sessionStorage.getItem('isTableView');
    return stored !== null ? JSON.parse(stored) : false;
  } catch (error) {
    console.error('Error reading from session storage:', error);
    return false;
  }
};

export const setTableViewPreference = (value: boolean): void => {
  try {
    sessionStorage.setItem('isTableView', JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to session storage:', error);
  }
};