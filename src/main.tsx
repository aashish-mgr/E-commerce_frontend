import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import store from './store/store.ts'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  
    <Provider store={store}>
    <App />
    <Toaster
      position="bottom-right"
      richColors
      toastOptions={{
        classNames: {
          toast: "rounded-xl border-gray-200 shadow-sm",
        },
        actionButtonStyle: {
          backgroundColor: "#4f46e5",
          color: "#fff",
          borderRadius: "0.5rem",
          fontWeight: "600",
        },
        cancelButtonStyle: {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          borderRadius: "0.5rem",
        },
      }}
    />
    </Provider>
  ,
)
