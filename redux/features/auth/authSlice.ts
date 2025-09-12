import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, Business, Location, BusinessUpdate, SubscriptionPlanData, CreatePlanRequest, CreatePlanVariationRequest } from '../../services/authService';

export interface User {
  id: string;
  created_at: number;
  name: string;
  email: string;
  business_id: string;
  role: string;
  square_customer_id?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  business: Business | null;
  locations: Location[];
  businessLoading: boolean;
  businessError: string | null;
  subscriptionPlanData: SubscriptionPlanData | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
}

// Get initial token from localStorage
const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  isLoading: false,
  error: null,
  isAuthenticated: !!getInitialToken(),
  business: null,
  locations: [],
  businessLoading: false,
  businessError: null,
  subscriptionPlanData: null,
  subscriptionLoading: false,
  subscriptionError: null,
};

// Async thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (credentials: { name: string; email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const token = await authService.signup(credentials);
      
      // Fetch business data after successful signup
      try {
        await dispatch(getBusiness());
      } catch (businessError) {
        console.warn('Failed to fetch business data after signup:', businessError);
      }
      
      return token;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      const token = await authService.login(credentials);
      
      // Fetch business data after successful login
      try {
        await dispatch(getBusiness());
      } catch (businessError) {
        console.warn('Failed to fetch business data after login:', businessError);
      }
      
      return token;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getMe();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user info');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = getInitialToken();
      if (token) {
        const user = await authService.getMe();
        
        // Also fetch business data after successful user fetch
        try {
          await dispatch(getBusiness());
        } catch (businessError) {
          console.warn('Failed to fetch business data during initialization:', businessError);
        }
        
        return { token, user };
      }
      return null;
    } catch (error: any) {
      // If token is invalid, remove it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      return rejectWithValue(error.message || 'Failed to initialize auth');
    }
  }
);

// Business-related async thunks
export const getBusiness = createAsyncThunk(
  'auth/getBusiness',
  async (_, { rejectWithValue }) => {
    try {
      const business = await authService.getBusiness();
      return business;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get business');
    }
  }
);

export const getLocations = createAsyncThunk(
  'auth/getLocations',
  async (_, { rejectWithValue }) => {
    try {
      const locations = await authService.getLocations();
      return locations;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get locations');
    }
  }
);

export const updateBusiness = createAsyncThunk(
  'auth/updateBusiness',
  async (businessUpdate: BusinessUpdate, { rejectWithValue }) => {
    try {
      const business = await authService.updateBusiness(businessUpdate);
      return business;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update business');
    }
  }
);

export const revokeSquareConnection = createAsyncThunk(
  'auth/revokeSquareConnection',
  async (_, { rejectWithValue }) => {
    try {
      await authService.revokeSquareConnection();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to revoke Square connection');
    }
  }
);


export const getSubscriptionPlanVariations = createAsyncThunk(
  'auth/getSubscriptionPlanVariations',
  async (businessId: string, { rejectWithValue }) => {
    try {
      const data = await authService.getSubscriptionPlanVariations(businessId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get subscription plan variations');
    }
  }
);

export const createSubscriptionPlan = createAsyncThunk(
  'auth/createSubscriptionPlan',
  async (planData: CreatePlanRequest, { rejectWithValue }) => {
    try {
      const result = await authService.createSubscriptionPlan(planData);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create subscription plan');
    }
  }
);

export const createPlanVariation = createAsyncThunk(
  'auth/createPlanVariation',
  async (variationData: CreatePlanVariationRequest, { rejectWithValue }) => {
    try {
      const result = await authService.createPlanVariation(variationData);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create plan variation');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      })
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      // Get Business
      .addCase(getBusiness.pending, (state) => {
        state.businessLoading = true;
        state.businessError = null;
      })
      .addCase(getBusiness.fulfilled, (state, action) => {
        state.businessLoading = false;
        state.business = action.payload;
        state.businessError = null;
      })
      .addCase(getBusiness.rejected, (state, action) => {
        state.businessLoading = false;
        state.businessError = action.payload as string;
      })
      // Get Locations
      .addCase(getLocations.pending, (state) => {
        state.businessLoading = true;
        state.businessError = null;
      })
      .addCase(getLocations.fulfilled, (state, action) => {
        state.businessLoading = false;
        state.locations = action.payload;
        state.businessError = null;
      })
      .addCase(getLocations.rejected, (state, action) => {
        state.businessLoading = false;
        state.businessError = action.payload as string;
      })
      // Update Business
      .addCase(updateBusiness.pending, (state) => {
        state.businessLoading = true;
        state.businessError = null;
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        state.businessLoading = false;
        state.business = action.payload;
        state.businessError = null;
      })
      .addCase(updateBusiness.rejected, (state, action) => {
        state.businessLoading = false;
        state.businessError = action.payload as string;
      })
      // Revoke Square Connection
      .addCase(revokeSquareConnection.pending, (state) => {
        state.businessLoading = true;
        state.businessError = null;
      })
      .addCase(revokeSquareConnection.fulfilled, (state) => {
        state.businessLoading = false;
        state.business = null;
        state.locations = [];
        state.businessError = null;
      })
      .addCase(revokeSquareConnection.rejected, (state, action) => {
        state.businessLoading = false;
        state.businessError = action.payload as string;
      })
      // Get Subscription Plan Variations
      .addCase(getSubscriptionPlanVariations.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(getSubscriptionPlanVariations.fulfilled, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionPlanData = action.payload;
        state.subscriptionError = null;
      })
      .addCase(getSubscriptionPlanVariations.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      })
      // Create Subscription Plan
      .addCase(createSubscriptionPlan.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(createSubscriptionPlan.fulfilled, (state) => {
        state.subscriptionLoading = false;
        state.subscriptionError = null;
      })
      .addCase(createSubscriptionPlan.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      })
      // Create Plan Variation
      .addCase(createPlanVariation.pending, (state) => {
        state.subscriptionLoading = true;
        state.subscriptionError = null;
      })
      .addCase(createPlanVariation.fulfilled, (state) => {
        state.subscriptionLoading = false;
        state.subscriptionError = null;
      })
      .addCase(createPlanVariation.rejected, (state, action) => {
        state.subscriptionLoading = false;
        state.subscriptionError = action.payload as string;
      });
  },
});

export const { clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
