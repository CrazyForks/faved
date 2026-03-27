import { observer } from 'mobx-react-lite';
import { AppleShortcut } from '@/components/Settings/Integrations/AppleShortcut.tsx';
import { Bookmarklet } from '@/components/Settings/Integrations/Bookmarklet.tsx';
export const SettingsIntegrations = observer(({ onSuccess, source }: { onSuccess?: () => void; source: string }) => {
  return (
    <div className="mx-auto w-full space-y-6">
      <Bookmarklet onSuccess={onSuccess} />
      <AppleShortcut onSuccess={onSuccess} source={source} />
    </div>
  );
});
