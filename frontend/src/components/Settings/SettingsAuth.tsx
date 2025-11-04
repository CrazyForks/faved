import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { UserCreate } from '@/components/Settings/UserCreate.tsx';
import { UserUsernameEdit } from '@/components/Settings/UserUsernameEdit.tsx';
import { UserPasswordEdit } from '@/components/Settings/UserPasswordEdit.tsx';
import { UserDelete } from '@/components/Settings/UserDelete.tsx';

export const SettingsAuth = observer(() => {
  const store = React.useContext(StoreContext);
  React.useEffect(() => {
    store.getUser();
  }, [store]);

  if (!store.user) {
    return <UserCreate />;
  }

  return (
    <div className="flex flex-col gap-4">
      <UserUsernameEdit />
      <UserPasswordEdit />
      <UserDelete />
    </div>
  );
});
