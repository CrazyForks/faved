import { ReactNode } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useSidebar } from '@/components/ui/sidebar.tsx';
import { useIsMobile } from '@/hooks/use-mobile.ts';

type Props = {
  trigger: ReactNode | null;
  children: ReactNode;
};

export function ResponsivePanel({ trigger, children }: Props) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>

        <SheetContent side="right">{children}</SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent>{children}</DrawerContent>
    </Drawer>
  );
}
