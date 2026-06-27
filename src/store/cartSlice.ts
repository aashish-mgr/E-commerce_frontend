import { createSlice } from "@reduxjs/toolkit";
import { STATUS, type Cart } from "../types";
import type { PayloadAction } from "@reduxjs/toolkit";
import { authAPI } from "../api";


 
interface cartState {
    cart: Cart[] | null,
    status: STATUS
}

const initialState: cartState = {
    cart: null,
    status: STATUS.Idle
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart(state, action: PayloadAction<Cart[] | null>) {
            state.cart = action.payload;
        },
        setStatus(state, action: PayloadAction<STATUS>) {
            state.status = action.payload;
        }
    }
})

export default cartSlice.reducer;
export const {setCart,setStatus} = cartSlice.actions;




export function getCartItems() {
    return async function getCartItemsThunk(dispatch: any) {
       dispatch(setStatus(STATUS.Loading));
       const res = await authAPI.get("/cart/getMyCarts");
       if(res.status === 200) {
        dispatch(setStatus(STATUS.Success));
        dispatch(setCart(res.data?.data));
        console.log(res);
    
    }
    setStatus(STATUS.Error);
    }
}