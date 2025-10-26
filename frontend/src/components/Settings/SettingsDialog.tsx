import * as React from "react"
import {Bookmark, ChevronLeft, ChevronRight, Import, Keyboard,} from "lucide-react"

import {Dialog, DialogContent, DialogHeader, DialogTitle,} from "@/components/ui/dialog"

import {StoreContext} from "@/store/storeContext"
import {observer} from "mobx-react-lite"
import {SettingsAuth} from "./SettingsAuth"
import {SettingsBookmarklet} from "./SettingsBookmarklet"
import {SettingsImport} from "./SettingsImport"

import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs"

const data = {
  nav: [
    {id: 'auth', title: "Authentication", icon: Keyboard, component: <SettingsAuth/>},
    {id: "bookmarklet", title: "Bookmarklet", icon: Bookmark, component: <SettingsBookmarklet/>},
    {id: "import", title: "Import", icon: Import, component: <SettingsImport/>},
  ],
}

export const SettingsDialog = observer(() => {
    const store = React.useContext(StoreContext);

    const defaultNav = store.preSelectedItemSettingsModal ?? data.nav[0].id;

    const [showTopNav, setShowTopNav] = React.useState(!store.preSelectedItemSettingsModal)

    // For title display
    const [selectedNav, setSelectedNav] = React.useState(defaultNav)
    const selectedNavTitle = data.nav.find(item => item.id === selectedNav)?.title

    return (
      <Dialog open={true} onOpenChange={store.setIsOpenSettingsModal}>
        <DialogContent className="overflow-hidden w-[100dvw] md:w-[95dvw] max-w-6xl rounded-none md:rounded-lg p-0">
          <div className="h-[100dvh] md:h-[95dvh] md:max-h-[1000px] p-3 pt-15 md:pt-3 relative">
            <DialogHeader className="md:sr-only fixed w-full top-6">
              <DialogTitle className="text-center">{showTopNav ? 'Settings' : selectedNavTitle}</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue={defaultNav} onValueChange={(v) => setSelectedNav(v)}
                  className="flex flex-row items-stretch justify-normal gap-0 w-full h-full ">

              <TabsList
                className={'md:p-2 h-full w-full min-w-56 md:w-auto bg-transparent md:bg-muted flex-col items-stretch justify-start gap-1' + (showTopNav ? ' inline-flex' : ' hidden md:inline-flex')}>

                {data.nav.map((item) => (
                  <TabsTrigger key={item.id}
                               className="py-2 px-3 text-base md:text-sm md:py-1 flex items-center gap-3 justify-start items-center rounded-sm flex-0 data-[state=active]:shadow-none md:data-[state=active]:bg-primary/90 md:data-[state=active]:text-primary-foreground hover:bg-primary/5"
                               value={item.id}
                               onClick={() => {
                                 setShowTopNav(false)
                               }}
                  >
                    <item.icon/>
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto block md:hidden"/>
                  </TabsTrigger>
                ))}

              </TabsList>
              <div
                className={'px-1 md:px-8 py-3 w-full h-full overflow-y-scroll overflow-x-hidden ' + (showTopNav ? ' hidden md:inline-flex' : '')}>
                <Button onClick={() => setShowTopNav(true)} variant="outline"
                        className="md:hidden rounded-full aspect-square w-10 h-10 fixed top-4 left-4 z-10">
                  <ChevronLeft/>
                </Button>
                {data.nav.map((item) => {
                  return <TabsContent key={item.id} value={item.id}>
                    {item.component}
                  </TabsContent>
                })}
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)