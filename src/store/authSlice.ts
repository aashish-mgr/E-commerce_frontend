import { createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User{
    userName: string,
    email: string,
    password: string

}

interface AuthState {
    user: User | null,
    isAuthenticated: boolean,
    token: string | null
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null
}
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) =>  {
            state.isAuthenticated = action.payload;
        },
        setUserData: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload
        },
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload
        }
    }
})

export default authSlice.reducer;