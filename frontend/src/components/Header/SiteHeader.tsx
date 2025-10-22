import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Import } from "lucide-react"
import { useContext } from "react"
import { StoreContext } from "@/store/storeContext"
import { ModeToggle } from "../mode-toggle"
import { ActionType } from "../dashboard/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export const SiteHeader: React.FC<{ setType: (val: ActionType) => void }> = ({ setType }) => {
  const store = useContext(StoreContext);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Button variant="default" size="sm" className="sm:flex" onClick={() => { store.setIsShowEditModal(true); setType(ActionType.CREATE) }}>
          New item
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={() => {
              store.setPreSelectedItemSettingsModal('import')
              store.setIsOpenSettingsModal(true);
            }} variant="outline" size="sm" className="sm:flex">
              <Import />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import Bookmarks</p>
          </TooltipContent>
        </Tooltip>


        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>



      </div>
    </header>
  )
}
