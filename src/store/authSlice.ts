import { createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {API} from '../api/index';



enum AuthStatus {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}

interface User{
    userName: string,
    email: string,
    password: string

}

interface RegisterData {
     userName: string, 
     userEmail: string,
     userPassword: string
}

interface LoginData {
    userEmail: string,
    userPassword: string
}


interface AuthState {
    user: User | null,
    isAuthenticated: boolean,
    token: string | null,
    status: AuthStatus
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null,
    status:  AuthStatus.Idle
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
        },
        setStatus: (state, action: PayloadAction<AuthStatus>) => {
            state.status = action.payload
        }
    }
}) 
export const {setUserData, setStatus,setAuthenticated} = authSlice.actions

export function registerUser(userData: RegisterData) {
    
    return async function registerThunk (dispatch: any) {
        dispatch(setStatus(AuthStatus.Loading));
        try{
       const response =await API.post("/auth/register",userData);
       if(response.status === 200) {
          dispatch(setStatus(AuthStatus.Success));
          alert("Registration Successful! Please Login.");
       }
       else {
         dispatch(setStatus(AuthStatus.Error));
       }
    }
    catch(error) {
        setStatus(AuthStatus.Error);
    }

    }
}

export function loginUser(userData: LoginData) {
    
    return async function registerThunk (dispatch: any) {
        dispatch(setStatus(AuthStatus.Loading));
        try{
       const response =await API.post("/auth/login",userData);
       if(response.status === 200) {
          dispatch(setStatus(AuthStatus.Success));
          dispatch(setUserData(response.data));
          dispatch(setAuthenticated(true));
          alert("Login Successful!");
       }
       else {
         dispatch(setStatus(AuthStatus.Error));
       }
    }
    catch(error) {
        setStatus(AuthStatus.Error);
    }

    }
}

export default authSlice.reducer;