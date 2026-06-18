// src/components/Providers.tsx   (or app/Providers.tsx)

import { Provider } from 'react-redux';
import { store } from '../store';

export function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
