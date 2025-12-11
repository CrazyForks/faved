import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import mainStore from './store/mainStore.ts';
import { StoreContext } from './store/storeContext.ts';
import { ThemeProvider } from './components/ThemeProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StoreContext.Provider value={mainStore}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StoreContext.Provider>
);
