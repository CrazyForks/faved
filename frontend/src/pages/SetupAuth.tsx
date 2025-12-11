import { Button } from '@/components/ui/button.tsx';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { Navigate, useNavigate } from 'react-router-dom';

import { UserCreate } from '@/components/Settings/UserCreate.tsx';
import { Onboarding } from '@/layouts/Onboarding.tsx';

export const SetupAuth = observer(() => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const nextStep = '/setup/bookmarklet';

  if (store.user) {
    return <Navigate to={nextStep} replace={true} />;
  }

  return (
    <Onboarding currentStep={1}>
      <UserCreate onSuccess={() => navigate(nextStep)} />

      <Button variant="link" onClick={() => navigate(nextStep)}>
        Skip for now
      </Button>
    </Onboarding>
  );
});
