import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsBookmarklet } from '@/components/Settings/SettingsBookmarklet.tsx';
import { Onboarding } from '@/layouts/Onboarding.tsx';

export const SetupBookmarklet = () => {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);

  return (
    <Onboarding currentStep={2}>
      <SettingsBookmarklet
        onSuccess={() => {
          setIsInstalled(true);
        }}
      />

      <>
        {isInstalled ? (
          <Button className="w-full" onClick={() => navigate('/setup/import')}>
            Next: Import Bookmarks
          </Button>
        ) : (
          <Button variant="link" onClick={() => navigate('/setup/import')}>
            Skip for now
          </Button>
        )}
      </>
    </Onboarding>
  );
};
