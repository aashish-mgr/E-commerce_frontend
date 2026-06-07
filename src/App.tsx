
import './App.css'
import {Provider} from 'react-redux'
import store from './store/store'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import Dashboard from './pages/Dashboard.tsx'
import { useEffect } from 'react'
import { getUserProfile } from './store/authSlice.ts'
import { useDispatch } from 'react-redux'




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
