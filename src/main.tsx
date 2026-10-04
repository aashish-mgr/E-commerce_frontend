import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import store from './store/store.ts'
import { Provider } from 'react-redux'
import { Toaster } from 'sonner'
import { MotionConfig } from 'motion/react'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <MotionConfig reducedMotion="user">
      <App />
      <Toaster
        position="bottom-right"
        richColors={false}
        toastOptions={{
          classNames: {
            toast:
              '!rounded-panel !border !border-line !bg-surface !text-ink !shadow-lift',
            title: '!text-sm !font-semibold !text-ink',
            description: '!text-sm !text-muted',
            actionButton:
              '!rounded-control !bg-pine !px-3 !text-sm !font-semibold !text-paper',
            cancelButton:
              '!rounded-control !bg-paper-2 !px-3 !text-sm !font-medium !text-ink-2',
          },
        }}
      />
    </MotionConfig>
  </Provider>,
)