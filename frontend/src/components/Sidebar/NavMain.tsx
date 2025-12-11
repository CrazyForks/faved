import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import * as React from 'react';
import { observer } from 'mobx-react-lite';

export const NavMain = observer(() => {
  const store = React.useContext(StoreContext);
  const { isMobile, toggleSidebar } = useSidebar();

  const setAllTags = () => {
    store.setCurrentTagId(0);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const setNoTags = () => {
    store.setCurrentTagId(null);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const navLinks = [
    {
      title: 'All items',
      onClick: setAllTags,
      isSelected: store.selectedTagId === '0',
      icon: null,
    },
    {
      title: 'Untagged',
      onClick: setNoTags,
      isSelected: store.selectedTagId === null,
      icon: null,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {navLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                onClick={item.onClick}
                className={
                  'active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear' +
                  (item.isSelected ? ' !bg-primary !text-primary-foreground' : '')
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
