import { createContext } from 'react';
import mainStore from './mainStore';

export const StoreContext = createContext(mainStore);
