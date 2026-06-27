import { createSlice } from "@reduxjs/toolkit";
import { STATUS, type Cart } from "../types";
import type { PayloadAction } from "@reduxjs/toolkit";


 
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


export function addToCart () {
    return async function addToCartThunk (dispatch: any) {
        dispatch(setStatus(STATUS.Loading));

    }
}