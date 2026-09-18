import {configureStore} from '@reduxjs/toolkit'
import authSlice, { setUserData, setAuthenticated } from './authSlice';
import  cartSlice  from './cartSlice';
import { setUnauthorizedHandler } from '../api/index';

const store = configureStore({
  reducer: {
   auth: authSlice,
   cart: cartSlice
  }
})

setUnauthorizedHandler(() => {
  store.dispatch(setUserData(null));
  store.dispatch(setAuthenticated(false));
});

export default store;
