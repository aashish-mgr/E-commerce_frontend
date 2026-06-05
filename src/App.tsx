
import './App.css'
import {Provider} from 'react-redux'
import store from './store/store'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import Dashboard from './pages/Dashboard.tsx'



function App() {


  return (
    <>
      <Provider store={store}>
        <BrowserRouter> 
          <Routes>
            <Route path='/' element={<LandingPage/>} />
            <Route path='/dashboard' element={<Dashboard/>} />
          </Routes>
        </BrowserRouter>

      </Provider>
    
    
    </>
  )
}

export default App
