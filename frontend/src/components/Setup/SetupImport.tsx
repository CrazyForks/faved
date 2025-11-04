import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { SettingsImport } from '../Settings/SettingsImport';
import { SetupWrapper } from '@/components/Setup/SetupWrapper';

export const SetupImport = () => {
  const navigate = useNavigate();

  return (
    <SetupWrapper currentStep={3}>
      <SettingsImport onSuccess={() => navigate('/')} />

      <Button variant="link" className="" onClick={() => navigate('/')}>
        Skip for now
      </Button>
    </SetupWrapper>
  );
};
