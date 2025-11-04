'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoreContext } from '@/store/storeContext';
import { observer } from 'mobx-react-lite';
import { useSidebar } from '@/components/ui/sidebar.tsx';

export const PresetActions = observer(() => {
  const store = React.useContext(StoreContext);
  const { isMobile, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={() => {
        store.setPreSelectedItemSettingsModal(null);
        store.setIsOpenSettingsModal(true);
        if (isMobile) {
          toggleSidebar();
        }
      }}
    >
      <span className="sr-only">Actions</span>
      <SlidersHorizontal />
    </Button>
  );
});
