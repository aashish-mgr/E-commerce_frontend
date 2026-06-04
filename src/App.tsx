
import './App.css'
import {Provider} from 'react-redux'
import store from './store/store'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'


function App() {


  return (
    <>
      <Provider store={store}>
        <BrowserRouter> 
          <Routes>
            <Route path='/' element={<LandingPage />} />
          </Routes>
        </BrowserRouter>

      </Provider>
    
    
    </>
  )
}

export default App
