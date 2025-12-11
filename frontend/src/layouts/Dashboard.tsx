import { SidebarProvider } from '@/components/ui/sidebar.tsx';
import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { AppSidebar } from '@/components/Sidebar/AppSidebar.tsx';
import { SettingsDialog } from '../components/Settings/SettingsDialog.tsx';
import Loading from '@/layouts/Loading.tsx';
import { EditItemDialog } from '@/components/EditItem/EditItemDialog.tsx';

export const Dashboard = observer(({ children }: { children: React.ReactNode }) => {
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
        <AppSidebar />
        <main className="bg-background @container/main relative flex w-full flex-1 flex-col">{children}</main>
      </SidebarProvider>
      {store.isShowEditModal && <EditItemDialog />}
      {store.isOpenSettingsModal && <SettingsDialog />}
    </>
  );
});
