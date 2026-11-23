import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { CatalogProvider } from './context/CatalogContext';
import './styles.css';

// TypeScript kiểm tra trường hợp không tìm thấy phần tử #root.
const root = document.getElementById('root');
if (!root) throw new Error('Không tìm thấy thẻ div có id="root" trong index.html');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider><CatalogProvider><App /></CatalogProvider></AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
