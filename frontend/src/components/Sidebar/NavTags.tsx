import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar.tsx';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { TagType } from '@/lib/types.ts';
import { SidebarTag } from '@/components/Sidebar/SidebarTag.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';
import { Search, SearchIcon, X } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group.tsx';
import { Kbd } from '@/components/ui/kbd.tsx';

export const NavTags = observer(({ itemIDsByTagID }) => {
  const store = React.useContext(StoreContext);
  const selectedTag = store.tags[store.tagFilter] ?? null;
  const [tagSearchValue, setTagSearchValue] = useState('');

  const allTags = useMemo(() => Object.values(store.tags) as TagType[], [store.tags]);

  const [isTagSearchVisible, setIsTagSearchVisible] = useState(false);
  const tagSearchRef = React.useRef(null);

  const hideTagSearch = () => {
    setTagSearchValue('');
    setIsTagSearchVisible(false);
  };

  const showTagSearch = () => {
    setIsTagSearchVisible(true);
    setTimeout(() => {
      tagSearchRef.current.focus();
    }, 50);
  };

  const renderTag = useCallback(
    (parentID: number, threadItemIDs = [], threadMatchesSearch = false): [React.JSX.Element[], number[], boolean] => {
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
      let levelTagsMatchSearch = false;

      for (const tag of tags) {
        const isTagSelected = store.tagFilter === tag.id;
        const isChildTagSelected = !isTagSelected && selectedTag && selectedTag.fullPath.indexOf(tag.fullPath) === 0;

        const isTagSearchActive = tagSearchValue !== '';
        const currentTagMatchesSearch =
          isTagSearchActive && tag.title.toLowerCase().includes(tagSearchValue.toLowerCase());

        const currentTagItemIDs = itemIDsByTagID[tag.id] ?? [];
        const [renderedChildTags, childTagsItemIDs, childTagsMatchSearch] = renderTag(
          tag.id,
          [...threadItemIDs, ...currentTagItemIDs],
          threadMatchesSearch || currentTagMatchesSearch
        );
        // Ensure we don't double count items that are assigned multiple child tags and/or current tag and child tags
        const accountedItemIDs = new Set([...currentTagItemIDs, ...childTagsItemIDs]);
        levelItemIDs = [...levelItemIDs, ...accountedItemIDs];

        if (!isTagSearchActive || currentTagMatchesSearch || childTagsMatchSearch || threadMatchesSearch) {
          const renderedTag = (
            <SidebarTag
              key={tag.id}
              tag={tag}
              renderedChildTags={renderedChildTags}
              itemCount={accountedItemIDs.size}
              isTagSelected={isTagSelected}
              isChildTagSelected={isChildTagSelected}
              childTagsMatchSearch={childTagsMatchSearch}
              hightlightText={currentTagMatchesSearch ? tagSearchValue : null}
            />
          );
          renderedTags.push(renderedTag);
        }

        if (currentTagMatchesSearch || childTagsMatchSearch) {
          levelTagsMatchSearch = true;
        }
      }

      return [renderedTags, levelItemIDs, levelTagsMatchSearch];
    },
    [allTags, selectedTag, store.tagFilter, itemIDsByTagID, tagSearchValue]
  );
  const [renderedTagTree] = renderTag(0);

  return (
    <SidebarGroup className="gap-2">
      {isTagSearchVisible ? (
        <InputGroup className="h-8 w-full">
          <InputGroupInput
            value={tagSearchValue}
            onChange={(e) => setTagSearchValue(String(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                hideTagSearch();
              }
            }}
            name="search"
            className="h-9 pl-6"
            placeholder="Filter tags..."
            ref={tagSearchRef}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end" onClick={hideTagSearch}>
            <InputGroupButton>
              <X className="mt-[1px]" /> <Kbd className="pointer-coarse:hidden">Esc</Kbd>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
          <SidebarGroupAction className="right-3" onClick={showTagSearch}>
            <Search /> <span className="sr-only">Filter tags</span>
          </SidebarGroupAction>
        </>
      )}

      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>{renderedTagTree}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
});
