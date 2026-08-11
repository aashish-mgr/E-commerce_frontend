import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null,
    status:  AuthStatus.Idle
}

export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: RegisterData, { rejectWithValue }) => {
        try {
            const response = await API.post("/auth/register", userData);

            if (response.status === 200) {
                alert("Registration Successful! Please Login.");
                return response.data;
            }

            return rejectWithValue('Registration failed');
        }
        catch (error) {
            return rejectWithValue('Registration failed');
        }
    }
)

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (userData: LoginData, { rejectWithValue }) => {
        try {
            const response = await authAPI.post("/auth/login", userData);

            if (response.status === 200) {
                alert("Login Successful!");
                return response.data as User;
            }

            alert("Login Failed! Please check your credentials.");
            return rejectWithValue('Login failed');
        }
        catch (error) {
            alert("Login Failed! Please check your credentials.");
            return rejectWithValue('Login failed');
        }
    }
)

export const LogoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.post("/auth/logout");
            alert("Logged out successfully!");
            return null;
        }
        catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
)

export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.get("/auth/getUserProfile");

            if (response.status === 200) {
                return response.data as User;
            }

            return rejectWithValue('Session lookup failed');
        }
        catch (error) {
            return rejectWithValue('Session lookup failed');
        }
    }
)

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
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = AuthStatus.Loading;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.status = AuthStatus.Success;
            })
            .addCase(registerUser.rejected, (state) => {
                state.status = AuthStatus.Error;
            })
            .addCase(loginUser.pending, (state) => {
                state.status = AuthStatus.Loading;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.status = AuthStatus.Success;
            })
            .addCase(loginUser.rejected, (state) => {
                state.status = AuthStatus.Error;
            })
            .addCase(LogoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.token = null;
                state.status = AuthStatus.Idle;
            })
            .addCase(LogoutUser.rejected, (state) => {
                state.status = AuthStatus.Error;
            })
            .addCase(getUserProfile.pending, (state) => {
                state.status = AuthStatus.Loading;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.status = AuthStatus.Success;
            })
            .addCase(getUserProfile.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.status = AuthStatus.Error;
            });
    }
}) 
export const {setUserData, setStatus,setAuthenticated} = authSlice.actions


export default authSlice.reducer;