import * as React from 'react';
import { Button } from '@/components/ui/button.tsx';
import { RefreshCw, Trash, X } from 'lucide-react';
import { StoreContext } from '@/store/storeContext.ts';
import { Spinner } from '@/components/ui/spinner.tsx';
import { DeleteDialog } from '@/components/Table/Controls/DeleteDialog.tsx';
import { useSidebar } from '@/components/ui/sidebar.tsx';
import { cn } from '@/lib/utils.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';

export const BulkActionControls = ({ table }) => {
  const { isMobile, state } = useSidebar();
  const enableSidebarIndent = !isMobile && state === 'expanded';
  const store = React.useContext(StoreContext);
  const [deleteInProgress, setDeleteInProgress] = React.useState(false);
  const [fetchInProgress, setFetchInProgress] = React.useState(false);
  const filteredSelectedRows = table.getFilteredSelectedRowModel().rows;

  const deleteSelected = async () => {
    setDeleteInProgress(true);
    const result = await store.deleteItems(filteredSelectedRows.map((row) => row.original.id));
    if (!result) {
      return;
    }
    store.fetchItems();
    table.resetRowSelection();
    setDeleteInProgress(false);
  };

  const refetchSelected = async () => {
    setFetchInProgress(true);
    const result = await store.refetchItems(filteredSelectedRows.map((row) => row.original.id));
    if (result) {
      store.fetchItems();
    }
    setFetchInProgress(false);
  };

  if (table.getFilteredSelectedRowModel().rows.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-[1dvh] z-50 flex translate-x-1/2 items-center gap-1 md:bottom-[3dvh]',
        enableSidebarIndent ? 'right-[calc((100%-287px)/2)]' : 'right-1/2'
      )}
    >
      <Button
        variant="outline"
        className="bg-primary-foreground/80 rounded-full backdrop-blur-sm"
        onClick={() => table.toggleAllPageRowsSelected(true)}
      >
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          aria-label="Select all"
          className="bg-primary-foreground"
        />
        <span className="whitespace-nowrap">{table.getFilteredSelectedRowModel().rows.length} selected</span>
      </Button>
      <Button
        variant="outline"
        onClick={refetchSelected}
        disabled={fetchInProgress}
        className="bg-primary-foreground/80 rounded-full backdrop-blur-sm"
      >
        {fetchInProgress ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
        Refetch
      </Button>
      <DeleteDialog onConfirm={deleteSelected} itemsCount={table.getFilteredSelectedRowModel().rows.length}>
        <Button
          variant="outline"
          disabled={deleteInProgress}
          className="bg-primary-foreground/80 rounded-full backdrop-blur-sm"
        >
          {deleteInProgress ? <Spinner /> : <Trash />}
          Delete
        </Button>
      </DeleteDialog>
      <Button
        variant="outline"
        size="icon"
        onClick={() => table.resetRowSelection()}
        className="bg-primary-foreground/80 rounded-full backdrop-blur-sm"
      >
        <X />
      </Button>
    </div>
  );
};
