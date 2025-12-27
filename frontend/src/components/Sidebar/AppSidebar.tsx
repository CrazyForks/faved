import * as React from 'react';

import { NavMain } from '@/components/Sidebar/NavMain.tsx';
import { NavUser } from '@/components/Sidebar/NavUser.tsx';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';
import { SettingsButton } from './SettingsButton.tsx';
import { Logo } from '@/components/Logo.tsx';
import { ThemeToggler } from '@/components/Sidebar/ThemeToggler.tsx';
import { NavTags } from '@/components/Sidebar/NavTags.tsx';

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar = observer(({ ...props }: AppSidebarProps) => {
  const store = React.useContext(StoreContext);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex w-full justify-between">
            <Logo />
            <div className="ml-auto flex items-center gap-0.5">
              <ThemeToggler />
              <SettingsButton />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="no-scrollbar gap-0">
        <NavMain />
        <NavTags />
      </SidebarContent>
      {store.user && (
        <SidebarFooter>
          <NavUser username={store.user.username} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
});
