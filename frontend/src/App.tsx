import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import './App.css'
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from './store/storeContext';
import { LoginPage } from './components/Login/LoginPage';
import { Setup } from './components/Setup/Setup';
import { SetupAuth } from './components/Setup/SetupAuth';
import { SetupImport } from './components/Setup/SetupImport';
import { SetupBookmarklet } from './components/Setup/SetupBookmarklet';
import { Toaster } from './components/ui/sonner';
import { Page } from './components/dashboard/page';
import EditItemForm from './components/EditForm/EditItemForm';
import { Dialog } from './components/ui/dialog';
import { NotFound } from './components/NotFound';
import Loading from "@/components/Loading"

const SetupMiddleware = observer(() => {
  const location = useLocation();

  const store = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // this call sets up store.showInitializeDatabasePage
      await store.getUser(true)
      setIsLoading(false)
    };

    loadData();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  // If we are not on the setup page, and need to be, redirect to setup
  const isSetupPage = location.pathname === '/setup';

  if (!isSetupPage && store.showInitializeDatabasePage) {
    return <Navigate to="/setup" replace />;
  }

  // If we are not on the login page, and need to be, redirect to login
  const isLoginPage = location.pathname === '/login';
  if (store.isAuthRequired && !isLoginPage) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Otherwise continue
  return <Outlet />;
})


const App = observer(() => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SetupMiddleware />}>
          <Route path="/" element={<Page />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/setup/auth" element={<SetupAuth />} />
          <Route path="/setup/import" element={<SetupImport />} />
          <Route path="/setup/bookmarklet" element={<SetupBookmarklet />} />
          <Route path="/create-item"
            element={<EditItemForm isCloseWindowOnSubmit={true} />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
})

export default App
