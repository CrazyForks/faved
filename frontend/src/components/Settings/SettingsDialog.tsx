import * as React from 'react';
import { Bookmark, ChevronLeft, ChevronRight, Import, Keyboard } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { StoreContext } from '@/store/storeContext';
import { observer } from 'mobx-react-lite';
import { SettingsAuth } from './SettingsAuth';
import { SettingsBookmarklet } from './SettingsBookmarklet';
import { SettingsImport } from './SettingsImport';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const data = {
  nav: [
    { id: 'auth', title: 'Authentication', icon: Keyboard, component: <SettingsAuth /> },
    { id: 'bookmarklet', title: 'Bookmarklet', icon: Bookmark, component: <SettingsBookmarklet /> },
    { id: 'import', title: 'Import', icon: Import, component: <SettingsImport /> },
  ],
};

export const SettingsDialog = observer(() => {
  const store = React.useContext(StoreContext);

  const defaultNav = store.preSelectedItemSettingsModal ?? data.nav[0].id;

  const [showTopNav, setShowTopNav] = React.useState(!store.preSelectedItemSettingsModal);

  // For title display
  const [selectedNav, setSelectedNav] = React.useState(defaultNav);
  const selectedNavTitle = data.nav.find((item) => item.id === selectedNav)?.title;

  return (
    <Dialog open={true} onOpenChange={store.setIsOpenSettingsModal}>
      <DialogContent className="w-[100dvw] max-w-6xl overflow-hidden rounded-none p-0 md:w-[95dvw] md:rounded-lg">
        <div className="relative h-[100dvh] p-3 pt-15 md:h-[95dvh] md:max-h-[1000px] md:pt-3">
          <DialogHeader className="fixed top-6 w-full md:sr-only">
            <DialogTitle className="text-center">{showTopNav ? 'Settings' : selectedNavTitle}</DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue={defaultNav}
            onValueChange={(v) => setSelectedNav(v)}
            className="flex h-full w-full flex-row items-stretch justify-normal gap-0"
          >
            <TabsList
              className={
                'md:bg-muted h-full w-full min-w-56 flex-col items-stretch justify-start gap-1 bg-transparent md:w-auto md:p-2' +
                (showTopNav ? ' inline-flex' : ' hidden md:inline-flex')
              }
            >
              {data.nav.map((item) => (
                <TabsTrigger
                  key={item.id}
                  className="md:data-[state=active]:bg-primary/90 md:data-[state=active]:text-primary-foreground hover:bg-primary/5 flex flex-0 items-center justify-start gap-3 rounded-sm px-3 py-2 text-base data-[state=active]:shadow-none md:py-1 md:text-sm"
                  value={item.id}
                  onClick={() => {
                    setShowTopNav(false);
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto block md:hidden" />
                </TabsTrigger>
              ))}
            </TabsList>
            <div
              className={
                'h-full w-full overflow-x-hidden overflow-y-scroll px-1 py-3 md:px-8 ' +
                (showTopNav ? ' hidden md:inline-flex' : '')
              }
            >
              <Button
                onClick={() => setShowTopNav(true)}
                variant="outline"
                className="fixed top-4 left-4 z-10 aspect-square h-10 w-10 rounded-full md:hidden"
              >
                <ChevronLeft />
              </Button>
              {data.nav.map((item) => {
                return (
                  <TabsContent key={item.id} value={item.id}>
                    {item.component}
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
});
