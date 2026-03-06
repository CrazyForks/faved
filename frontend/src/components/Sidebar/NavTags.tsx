import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu } from '@/components/ui/sidebar.tsx';
import * as React from 'react';
import { TagType } from '@/lib/types.ts';
import { SidebarTag } from '@/components/Sidebar/SidebarTag.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';

export const NavTags = observer(({ itemIDsByTagID }) => {
  const store = React.useContext(StoreContext);
  const selectedTag = store.tags[store.tagFilter] ?? null;
  const allTags = Object.values(store.tags) as TagType[];

  const renderTag = (parentID: number, threadItemIDs = []): [React.JSX.Element[], number[]] => {
    const renderedTags: React.JSX.Element[] = [];
    const tags: TagType[] = allTags.filter((tag: TagType) => tag.parent === parentID) as TagType[];
    tags.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1;
      }
      if (!a.pinned && b.pinned) {
        return 1;
      }
      return a.title.localeCompare(b.title);
    });

    let levelItemIDs = [];

    for (const tag of tags) {
      const isTagSelected = store.tagFilter === tag.id;
      const isChildTagSelected = !isTagSelected && selectedTag && selectedTag.fullPath.indexOf(tag.fullPath) === 0;

      const currentTagItemIDs = itemIDsByTagID[tag.id] ?? [];
      const [renderedChildTags, childTagsItemIDs] = renderTag(tag.id, [...threadItemIDs, ...currentTagItemIDs]);
      // Ensure we don't double count items that are assigned multiple child tags and/or current tag and child tags
      const accountedItemIDs = new Set([...currentTagItemIDs, ...childTagsItemIDs]);
      levelItemIDs = [...levelItemIDs, ...accountedItemIDs];

      const renderedTag = (
        <SidebarTag
          key={tag.id}
          tag={tag}
          renderedChildTags={renderedChildTags}
          itemCount={accountedItemIDs.size}
          isTagSelected={isTagSelected}
          isChildTagSelected={isChildTagSelected}
        />
      );
      renderedTags.push(renderedTag);
    }

    return [renderedTags, levelItemIDs];
  };
  const [renderedTagTree] = renderTag(0);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tags</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>{renderedTagTree}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
