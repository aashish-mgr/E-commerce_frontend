import './App.css'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import Dashboard from './pages/Dashboard.tsx'
import VendorDashboard from './pages/VendorDashboard.tsx'
import VendorOrderDetail from './pages/VendorOrderDetail.tsx'
import { useEffect } from 'react'
import { restoreSession } from './store/authSlice.ts'
import { useDispatch } from 'react-redux'

import ProductDetail from './Components/ProductDetail.tsx'
import NavbarProvider from './context/NavbarContext.tsx'
import Navbar from './Components/Navbar.tsx'
import ProtectedRoute from './Components/ProtectedRoute.tsx'
import VendorRoute from './Components/VendorRoute.tsx'
import Cart from './pages/Cart.tsx'
import Orders from './pages/Order.tsx'
import OrderDetail from './pages/OrderDetail.tsx'
import PlaceOrder from './pages/PlaceOrder.tsx'
import PaymentCallback from './pages/PaymentCallback.tsx'
import AuthComplete from './pages/AuthComplete.tsx'
import Login from './pages/Login.tsx'
import Profile from './pages/Profile.tsx'

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession() as any);
  }, [dispatch]);

  return (
    <NavbarProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<LandingPage/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/vendor/dashboard' element={<VendorRoute><VendorDashboard /></VendorRoute>} />
          <Route path='/vendor/order/:orderId' element={<VendorRoute><VendorOrderDetail /></VendorRoute>} />
          <Route path='/product/:id' element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path='/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/orders' element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/orderDetail/:id' element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path='/placeOrder' element={<ProtectedRoute><PlaceOrder /></ProtectedRoute>} />
          <Route path='/paymentCallback' element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
          <Route path='/auth/complete' element={<AuthComplete />} />
        </Routes>
      </BrowserRouter>
    </NavbarProvider>
  )
}

export default App