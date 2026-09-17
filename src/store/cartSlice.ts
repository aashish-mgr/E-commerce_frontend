import { createSlice } from "@reduxjs/toolkit";
import { STATUS, type Cart } from "../types";
import type { PayloadAction,Dispatch} from "@reduxjs/toolkit";
import { authAPI } from "../api";
import { toast, showErrorToast } from "../lib/toast";

 

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
    return async function getCartItemsThunk(dispatch: Dispatch) {
       dispatch(setStatus(STATUS.Loading));
       try{
       const res = await authAPI.get("/cart/getMyCarts");
       if(res.status === 200) {
        dispatch(setStatus(STATUS.Success));
        dispatch(setCart(res.data?.data));
       }
       }
       catch(error) {
        dispatch(setStatus(STATUS.Error));
        showErrorToast(error, "Failed to load cart.");
       }
    }
}

export function deleteCartItem(cartId: string) {
     return async function deleteCartItemThunk(dispatch: Dispatch) {
        try{
         dispatch(setStatus(STATUS.Loading));
         const res = await authAPI.delete(`/cart/delete/${cartId}`);
         if(res.status === 200) {
            dispatch(setStatus(STATUS.Success));
            toast.success("Item removed from cart.");
         }
     }
     catch(error) {
        dispatch(setStatus(STATUS.Error));
        showErrorToast(error, "Failed to remove item.");
     }
}
}

