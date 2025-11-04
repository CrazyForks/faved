import { SiteHeader } from '@/components/Header/SiteHeader';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext';
import { AppSidebar } from '@/components/Sidebar/AppSidebar';
import { DataTable } from '../Table/DataTable';
import { SettingsDialog } from '../Settings/SettingsDialog.tsx';
import { TagType } from '@/types/types';
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
  }, []);

  if (isLoading) {
    return <Loading />;
  }
  return (
    <>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" allTags={store.tags as unknown as Record<string, TagType>} />
        <SidebarInset>
          <SiteHeader setType={store.setType} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 md:gap-6">
                <DataTable />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      {store.isShowEditModal && <EditItemDialog />}
      {store.isOpenSettingsModal && <SettingsDialog />}
    </>
  );
});
