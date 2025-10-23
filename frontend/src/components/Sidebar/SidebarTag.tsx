import * as React from "react";
import {
  Sidebar,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub, useSidebar
} from "@/components/ui/sidebar.tsx";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible.tsx";
import { IconChevronRight, IconDotsVertical, IconPinned } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import { StoreContext } from "@/store/storeContext.ts";
import { colorMap } from "@/lib/utils.ts";
import {getColorClass} from "@/components/Table/TagBadge.tsx";


export function SidebarTag({ tag, innerItems = [], level, isTagSelected, isChildTagSelected }: { tag: any, innerItems?: React.ReactNode[], level: number, isTagSelected: boolean, isChildTagSelected?: boolean }) {
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(isChildTagSelected);

  const [newTagTitle, setNewTagTitle] = React.useState(tag.fullPath);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setNewTagTitle(tag.fullPath);
  }, [tag.fullPath]);

  React.useEffect(() => {
    if (isChildTagSelected !== true || isChildTagSelected === isCollapsibleOpen) {
      return;
    }
    setIsCollapsibleOpen(isChildTagSelected);
  }, [isChildTagSelected])

  const store = React.useContext(StoreContext);
  const { isMobile, toggleSidebar } = useSidebar()

  const deleteTag = () => {
    store.onDeleteTag(tag.id)
  }
  const enableRenaming = () => {
    setIsRenaming(true);
    if(!isMobile) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 50)
    }
  }

  const submit = () => {
    store.onChangeTagTitle(tag.id, newTagTitle as string);
    // Add your submit logic here, e.g., store.onUpdateTagTitle(tag.id, newTagTitle)
    setIsRenaming(false);
  }

  const revert = () => {
    setNewTagTitle(tag.fullPath);
    setIsRenaming(false);
  }

  const setTag = () => {
    if (isRenaming) {
      return;
    }

    store.setCurrentTagId(tag.id);
    store.setCurrentPage(1);
    if (isMobile) {
      toggleSidebar();
    }
  }


  const tagContent = (className = '') => {
    return (<>
      <div onClick={setTag} className={`${className} flex justify-start items-center text-left gap-2 py-2 w-full pe-6.5`}>
        <span className={`w-2.5 h-2.5 rounded-full flex-none ${getColorClass(tag.color)}`}></span>
        <input
          ref={inputRef}
          className={['tag-title-edit-input rounded-sm w-[85%]', (isRenaming ? '' : 'hidden'), (isMobile ? 'border-1' : 'border-none')].join(' ')}
          value={newTagTitle as string}
          onChange={(e) => setNewTagTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              revert();
            } else if (e.key === 'Enter') {
              submit();
            }
          }
          }
          onBlur={() => { !isMobile && revert() }}
        />
        {!isRenaming && <span title={tag.title} className="line-clamp-1 break-all">{tag.title}</span>}
        <IconPinned className={`ms-auto w-4 h-4 ` + (!!tag.pinned ? 'visible': 'invisible')} />
      </div>
    </>)
  }

  const actionButtons = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          className="data-[state=open]:bg-accent hover:bg-sidebar-accent rounded-sm sidebar-menu-action cursor-pointer"
        >
          <IconDotsVertical />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-24 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        {level === 1 && (<DropdownMenuItem onClick={() => store.onChangeTagPinned(tag.id, !tag.pinned)}>
          <span>{tag.pinned ? 'Unpin' : 'Pin'} tag</span>
        </DropdownMenuItem>)}
        <DropdownMenuItem onClick={enableRenaming}>
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
                  <span className={`w-3 h-3 rounded-full inline-block mr-1 ${colorMap[color]}`}></span> {color.charAt(0).toUpperCase() + color.slice(1)}
                  <span className="ml-auto">{tag.color === color ? "✓" : ""}</span>
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
  )

  const code = innerItems.length > 0 ?
    (<Collapsible className='group/collapsible' open={isCollapsibleOpen}
  >
    <SidebarMenuItem data-selected={isTagSelected}>
      <SidebarMenuButton className={'p-0 gap-0 active:bg-primary/90 active:text-primary-foreground' + (isTagSelected ? ' !bg-primary !text-primary-foreground' : '')}>
        <div className="p-2 hover:cursor-pointer" onClick={() => setIsCollapsibleOpen(!isCollapsibleOpen)}>
          <IconChevronRight className={`transition-transform w-4 h-4 ` + (isCollapsibleOpen ? ` rotate-90` : '')} />
        </div>
        {tagContent()}
      </SidebarMenuButton>

      <CollapsibleContent>
        <SidebarMenuSub>
          {innerItems}
        </SidebarMenuSub>
      </CollapsibleContent>
      {actionButtons}
    </SidebarMenuItem>
  </Collapsible>)
    :
    (<SidebarMenuItem data-selected={isTagSelected}>
      <SidebarMenuButton className={`p-0` + (isTagSelected ? ' bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : '')}>
        {tagContent('pl-8')}
      </SidebarMenuButton>
      {actionButtons}
    </SidebarMenuItem>)

  return (code)
}
