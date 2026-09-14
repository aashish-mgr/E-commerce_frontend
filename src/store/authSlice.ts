import { createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {API,authAPI} from '../api/index';



enum AuthStatus {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}

interface User{
    id: string,
    userName: string,
    userEmail: string,
    userRole: string
}

interface RegisterData {
     userName: string, 
     userEmail: string,
     userPassword: string,
     userRole: string
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
        dispatch(setStatus(AuthStatus.Error));
    }

    }
}

export function loginUser(userData: LoginData) {
    
    return async function loginThunk (dispatch: any) {
        dispatch(setStatus(AuthStatus.Loading));
        try{
       const response =await authAPI.post("/auth/login",userData);
       if(response.status === 200) {
          dispatch(setStatus(AuthStatus.Success));
          dispatch(setUserData(response.data?.data ?? null));
          dispatch(setAuthenticated(true));
          return response.data?.data;
       }
       else {
         dispatch(setStatus(AuthStatus.Error));
         alert("Login Failed! Please check your credentials.");
       }
    }
    catch(error) {
        dispatch(setStatus(AuthStatus.Error));
        alert("Login Failed! Please check your credentials.");
    }

    return null;
    }
}



export function LogoutUser() {
    return function logoutThunk (dispatch: any) {
         authAPI.post("/auth/logout");
        dispatch(setUserData(null));
        dispatch(setAuthenticated(false));
   
        alert("Logged out successfully!");
    }
}

export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, { dispatch, rejectWithValue }) => {
        dispatch(setStatus(AuthStatus.Loading));
        try{
         const response =await authAPI.get("/auth/getUserProfile");
            if(response.status === 200) {
                dispatch(setUserData(response.data?.data ?? null));
                dispatch(setAuthenticated(true));
                dispatch(setStatus(AuthStatus.Success));
                return response.data;
            }
            dispatch(setStatus(AuthStatus.Error));
            return rejectWithValue('Unable to fetch user profile');
        }
        catch(error) {
            dispatch(setStatus(AuthStatus.Error));
            return rejectWithValue(error);
        }
    }
);


export default authSlice.reducer;