import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import store from './store/store.ts'
import { Provider } from 'react-redux'
import { MotionConfig } from 'motion/react'
import { AppToaster } from './Components/AppToaster.tsx'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <MotionConfig reducedMotion="user">
      <App />
      <AppToaster />
    </MotionConfig>
  </Provider>,
)
