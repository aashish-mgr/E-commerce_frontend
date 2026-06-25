import { createSlice } from "@reduxjs/toolkit";
import type { Cart } from "../types";
import type { PayloadAction } from "@reduxjs/toolkit";

interface cartState {
    cart: Cart[] | null
}

const initialState: cartState = {
    cart: null
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart(state, action: PayloadAction<Cart[] | null>) {
            state.cart = action.payload;
        }
    }
})

export default cartSlice;
export const {setCart} = cartSlice.actions;