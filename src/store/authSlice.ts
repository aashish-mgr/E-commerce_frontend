import { createSlice} from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {API,authAPI} from '../api/index';



enum AuthStatus {
    Idle = "idle",
    Loading = "loading",
    Success = "success",
    Error = "error"
}

interface User{
    userName: string,
    userEmail: string,
    userPassword: string

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

const AUTH_STORAGE_KEY = "authState";

function getStoredAuthState(): Pick<AuthState, "user" | "isAuthenticated"> {
    if (typeof window === "undefined") {
        return { user: null, isAuthenticated: false };
    }

    try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) {
            return { user: null, isAuthenticated: false };
        }

        return JSON.parse(stored) as Pick<AuthState, "user" | "isAuthenticated">;
    } catch {
        return { user: null, isAuthenticated: false };
    }
}

function persistAuthState(state: Pick<AuthState, "user" | "isAuthenticated">) {
    if (typeof window === "undefined") {
        return;
    }

    if (!state.user || !state.isAuthenticated) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

const storedAuthState = getStoredAuthState();

const initialState: AuthState = {
    user: storedAuthState.user,
    isAuthenticated: storedAuthState.isAuthenticated,
    token: null,
    status:  AuthStatus.Idle
}
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) =>  {
            state.isAuthenticated = action.payload;
            persistAuthState({ user: state.user, isAuthenticated: state.isAuthenticated });
        },
        setUserData: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload
            persistAuthState({ user: state.user, isAuthenticated: state.isAuthenticated });
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
          dispatch(setUserData(response.data.data));
          dispatch(setAuthenticated(true));
         
          alert("Login Successful!");
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

    }
}

export function LogoutUser() {
    return function logoutThunk (dispatch: any) {
         authAPI.post("/auth/logout");
        dispatch(setUserData(null));
        dispatch(setAuthenticated(false));
        dispatch(setStatus(AuthStatus.Idle));
   
        alert("Logged out successfully!");
    }
}

export function getUserProfile() {
    return async function getUserProfileThunk (dispatch: any) {
        dispatch(setStatus(AuthStatus.Loading));
        try{
         const response =await authAPI.get("/auth/getUserProfile");
            if(response.status === 200) {
                dispatch(setUserData(response.data.data));
                dispatch(setAuthenticated(true));
                dispatch(setStatus(AuthStatus.Success));
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

export default authSlice.reducer;