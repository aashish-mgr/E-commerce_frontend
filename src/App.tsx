
import './App.css'
import {Provider} from 'react-redux'
import store from './store/store'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import Dashboard from './pages/Dashboard.tsx'
import { useEffect } from 'react'
import { getUserProfile } from './store/authSlice.ts'
import { useDispatch } from 'react-redux'

import ProductDetail from './Components/ProductDetail.tsx'
import NavbarProvider from './context/NavbarContext.tsx'
import Navbar from './Components/Navbar.tsx'
import Cart from './pages/Cart.tsx'
import Orders from './pages/Order.tsx'



function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      await dispatch(getUserProfile() as any);
    };

    fetchUserProfile();
  }, [dispatch]);

  return (
    <>
      <Provider store={store}>
        <NavbarProvider>
         
        <BrowserRouter> 
          <Navbar />
          <Routes>
            <Route path='/' element={<LandingPage/>} />
            <Route path='/dashboard' element={<Dashboard/>} />
            <Route path='/product/:id' element={<ProductDetail />} />
            <Route path='/cart' element={<Cart />} />
            <Route path= '/orders' element={<Orders />} />
          </Routes>
        </BrowserRouter>
        </NavbarProvider>

      </Provider>
    
    
    </>
  )
}

export default App
