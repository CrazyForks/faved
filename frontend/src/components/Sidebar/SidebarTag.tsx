import * as React from 'react';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from '@/components/ui/sidebar.tsx';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible.tsx';
import { IconChevronRight, IconDotsVertical, IconPinned } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { StoreContext } from '@/store/storeContext.ts';
import { cn, colorMap } from '@/lib/utils.ts';
import { getColorClass } from '@/components/Table/Fields/TagBadge.tsx';
import { useItemListState } from '@/hooks/useItemListState.ts';
import { TagType } from '@/lib/types.ts';

const TagOutput = ({ tag, prependedNode = null, childTags = null, level, isTagSelected, className }) => {
  const store = React.useContext(StoreContext);
  const { setTagFilter } = useItemListState();
  const { isMobile, toggleSidebar } = useSidebar();
  const [isRenaming, setIsRenaming] = React.useState(false);

  const [newTagTitle, setNewTagTitle] = React.useState(tag.fullPath);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setNewTagTitle(tag.fullPath);
  }, [tag.fullPath]);

  React.useEffect(() => {
    if (!isRenaming || isMobile) {
      return;
    }
    setTimeout(() => {
      inputRef.current.focus();
    }, 50);
  }, [isRenaming]);

  const submit = () => {
    store.onChangeTagTitle(tag.id, newTagTitle as string);
    // Add your submit logic here, e.g., store.onUpdateTagTitle(tag.id, newTagTitle)
    setIsRenaming(false);
  };

  const revert = () => {
    setNewTagTitle(tag.fullPath);
    setIsRenaming(false);
  };

  const setTag = () => {
    if (isRenaming) {
      return;
    }
    setTagFilter(tag.id);
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={setTag}
        isActive={isTagSelected}
        className={cn(
          prependedNode ? `ps-0` : 'ps-8',
          className,
          'data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground gap-0'
        )}
      >
        {prependedNode}

        <div className={cn('flex w-full items-center')}>
          <span className={cn('mr-2 h-2.5 w-2.5 flex-none rounded-full', getColorClass(tag.color))}></span>

          {isRenaming ? (
            <input
              ref={inputRef}
              className={cn('tag-title-edit-input w-[85%] rounded-sm', isMobile ? 'border-1' : 'border-none')}
              value={newTagTitle as string}
              onChange={(e) => setNewTagTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  revert();
                } else if (e.key === 'Enter') {
                  submit();
                }
              }}
              onBlur={() => {
                if (!isMobile) revert();
              }}
            />
          ) : (
            <>
              <span title={tag.title} className="line-clamp-1 break-all">
                {tag.title}
              </span>
              {tag.pinned && <IconPinned className="ms-auto h-4 w-4 flex-none" />}
            </>
          )}
        </div>
      </SidebarMenuButton>

      {childTags}

      <TagActions tag={tag} level={level} setIsRenaming={setIsRenaming} />

    </SidebarMenuItem>
  );
};

const TagActions = ({ tag, level, setIsRenaming }) => {
  const { isMobile } = useSidebar();
  const store = React.useContext(StoreContext);

  const deleteTag = () => {
    store.onDeleteTag(tag.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction showOnHover={true} className="cursor-pointer rounded-sm">
          <IconDotsVertical />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-24 rounded-lg"
        side={isMobile ? 'bottom' : 'right'}
        align={isMobile ? 'end' : 'start'}
      >
        {level === 1 && (
          <DropdownMenuItem onClick={() => store.onChangeTagPinned(tag.id, !tag.pinned)}>
            <span>{tag.pinned ? 'Unpin' : 'Pin'} tag</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setIsRenaming(true)}>
          <span>Rename</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger> Color</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {Object.keys(colorMap).map((color) => (
                <DropdownMenuItem
                  key={color}
                  className={`text-${colorMap[color]}-foreground hover:bg-${colorMap[color]}-foreground/10`}
                  onClick={() => store.onChangeTagColor(tag.id, color)}
                >
                  <span className={`mr-1 inline-block h-3 w-3 rounded-full ${colorMap[color]}`}></span>{' '}
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                  <span className="ml-auto">{tag.color === color ? '✓' : ''}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={deleteTag}>
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function SidebarTag({
  tag,
  renderedChildTags,
  level,
  isTagSelected,
  isChildTagSelected,
}: {
  tag: TagType;
  renderedChildTags: React.ReactNode[];
  level: number;
  isTagSelected: boolean;
  isChildTagSelected?: boolean;
}) {
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(isChildTagSelected);

  React.useEffect(() => {
    if (isChildTagSelected !== true || isChildTagSelected === isCollapsibleOpen) {
      return;
    }
    setIsCollapsibleOpen(isChildTagSelected);
  }, [isChildTagSelected]);

  const hasChildTags = renderedChildTags.length > 0;

  return hasChildTags ? (
    <Collapsible className="group/collapsible" open={isCollapsibleOpen}>
      <TagOutput
        tag={tag}
        level={level}
        isTagSelected={isTagSelected}
        className={cn(isChildTagSelected && !isCollapsibleOpen ? 'bg-primary/10' : '', 'gap-0')}
        prependedNode={
          <div
            className="p-2 hover:cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCollapsibleOpen(!isCollapsibleOpen);
            }}
          >
            <IconChevronRight className={cn('h-4 w-4 transition-transform', isCollapsibleOpen ? `rotate-90` : '')} />
          </div>
        }
        childTags={
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0">{renderedChildTags}</SidebarMenuSub>
          </CollapsibleContent>
        }
      />
    </Collapsible>
  ) : (
    <TagOutput tag={tag} level={level} isTagSelected={isTagSelected} />
  );
}
