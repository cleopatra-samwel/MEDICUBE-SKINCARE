import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import { store } from '@/store';
import { restoreSession } from '@/features/auth/authSlice';
import { fetchShopConfig } from '@/features/ui/uiSlice';
import { antTheme } from '@/config/theme';
import App from './App';
import './index.css';

// Confirm any stored token with the server before rendering protected pages.
store.dispatch(restoreSession());
store.dispatch(fetchShopConfig());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={antTheme}>
        <AntApp message={{ maxCount: 2, top: 84 }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
);
