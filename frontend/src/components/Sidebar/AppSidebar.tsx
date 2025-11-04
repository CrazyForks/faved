import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
import { SidebarTag } from '@/components/Sidebar/SidebarTag.tsx';
import { PresetActions } from '../dashboard/PresetActions';
import { TagType } from '@/types/types';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  allTags: Record<string, TagType>;
}

export const AppSidebar = observer(({ allTags, ...props }: AppSidebarProps) => {
  const store = React.useContext(StoreContext);
  const selectedTag = store.selectedTagId ? allTags[store.selectedTagId] : null;

  function renderTag(parentID: string | number, level = 0): React.JSX.Element[] {
    const output: React.JSX.Element[] = [];
    const tags = Object.values(allTags).filter((tag: TagType) => tag.parent === parentID);

    tags.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return a.title.localeCompare(b.title);
    });

    level++;

    for (const tag of tags) {
      const innerItems = renderTag(tag.id, level);
      const isTagSelected = store.selectedTagId === tag.id;
      const isChildTagSelected = !isTagSelected && selectedTag && selectedTag.fullPath.indexOf(tag.fullPath) === 0;

      const code = (
        <SidebarTag
          key={tag.id}
          tag={tag}
          innerItems={innerItems}
          level={level}
          isTagSelected={isTagSelected}
          isChildTagSelected={isChildTagSelected}
        />
      );
      output.push(code);
    }

    return output;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex w-full justify-between">
            <div className="flex flex-row items-start justify-center text-center">
              <img src="logo.png" alt="Faved logo" className="img-fluid pr-2 w-[36px] h-auto"></img>
              <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">Faved</h2>
            </div>
            <PresetActions />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="no-scrollbar">
        <NavMain />
        <SidebarMenu>{renderTag('0')}</SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{store.user && <NavUser username={store.user.username} />}</SidebarFooter>
    </Sidebar>
  );
});
