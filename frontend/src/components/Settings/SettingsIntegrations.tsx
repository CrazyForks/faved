import { Bookmarklet } from '@/components/Settings/Integrations/Bookmarklet.tsx';
import * as React from 'react';
import { observer } from 'mobx-react-lite';

export const SettingsIntegrations = observer(({ onSuccess }: { onSuccess?: () => void }) => {
  return (
    <div className="mx-auto w-full space-y-6">
      <Bookmarklet onSuccess={onSuccess} />
    </div>
  );
});
