import { SidebarProvider } from '@/components/ui/sidebar';
import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext';
import { AppSidebar } from '@/components/Sidebar/AppSidebar';
import { DataTable } from '../Table/DataTable';
import { SettingsDialog } from '../Settings/SettingsDialog.tsx';
import { TagType } from '@/lib/types.ts';
import Loading from '@/components/Loading';
import { EditItemDialog } from '@/components/EditForm/EditItemDialog.tsx';

export const Page = observer(() => {
  const store = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([store.fetchItems(), store.fetchTags()]);
      setIsLoading(false);
    };

    loadData();
  }, [store]);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 14)',
          } as React.CSSProperties
        }
      >
        <AppSidebar allTags={store.tags as unknown as Record<string, TagType>} />
        <main className="bg-background @container/main relative flex w-full flex-1 flex-col">
          <DataTable />
        </main>
      </SidebarProvider>
      {store.isShowEditModal && <EditItemDialog />}
      {store.isOpenSettingsModal && <SettingsDialog />}
    </>
  );
});
