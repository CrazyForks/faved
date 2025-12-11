import { createBrowserRouter, Navigate, Outlet, useLocation, useMatches } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from './store/storeContext';
import { Login } from './pages/Login.tsx';
import { Setup } from './pages/Setup.tsx';
import { SetupAuth } from './pages/SetupAuth.tsx';
import { SetupImport } from './pages/SetupImport.tsx';
import { SetupBookmarklet } from './pages/SetupBookmarklet.tsx';
import { Toaster } from './components/ui/sonner';
import EditItemForm from './components/EditItem/EditItemForm';
import { NotFound } from './layouts/NotFound.tsx';
import { RouterProvider } from 'react-router';
import { Spinner } from '@/components/ui/spinner.tsx';
import { ItemList } from '@/pages/ItemList.tsx';

const SetupMiddleware = observer(() => {
  const location = useLocation();
  const matches = useMatches();
  const currentRouteMatch = matches[matches.length - 1];
  const currentRouteId = currentRouteMatch?.id;

  const store = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);

  const isDashboardPage = currentRouteId === 'dashboard';
  useEffect(() => {
    if (!isDashboardPage) {
      return;
    }

    store.getAppInfo();
  }, [isDashboardPage, store]);

  useEffect(() => {
    const loadData = async () => {
      // this call sets up store.showInitializeDatabasePage
      await store.getUser(true);
      setIsLoading(false);
    };

    loadData();
  }, [store]);

  if (isLoading) {
    return (
      <div className="bg-background flex h-full min-h-screen w-full flex-col items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  // If we are not on the setup page while DB is not initialized, redirect to setup
  const isSetupPage = currentRouteId === 'setup';

  if (!isSetupPage && store.showInitializeDatabasePage) {
    return <Navigate to="/setup" replace />;
  }

  // If we are not on the login page while not signed in, redirect to login
  const isLoginPage = currentRouteId === 'auth-login';
  if (!isLoginPage && store.isAuthRequired) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Otherwise continue
  return <Outlet />;
});

const router = createBrowserRouter([
  {
    element: <SetupMiddleware />,
    children: [
      { path: '/', element: <ItemList />, id: 'dashboard' },
      { path: '/login', element: <Login />, id: 'auth-login' },
      { path: '/setup', element: <Setup />, id: 'setup' },
      { path: '/setup/auth', element: <SetupAuth /> },
      { path: '/setup/import', element: <SetupImport /> },
      { path: '/setup/bookmarklet', element: <SetupBookmarklet /> },
      { path: '/create-item', element: <EditItemForm isCloseWindowOnSubmit={true} /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

const App = observer(() => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
});

export default App;
