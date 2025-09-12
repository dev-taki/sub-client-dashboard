const API_BASE_URL = 'https://xwqm-zvzg-uzfr.n7e.xano.io/api:27BQ3PIV';
const SUBSCRIPTION_API_BASE_URL = 'https://xwqm-zvzg-uzfr.n7e.xano.io/api:fjTsAN4K';

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  created_at: number;
  name: string;
  email: string;
  business_id: string;
  role: string;
  square_customer_id?: string;
}

export interface Business {
  id: string;
  created_at: number;
  name: string;
  status: string;
  reason: string;
  currency: string;
  production_application_id: string;
  production_access_token: string;
  sandbox_application_id: string;
  sandbox_access_token: string;
  production_location_id: string;
  sandbox_location_id: string;
  mode: string;
  instruction_link: string;
  merchant_id: string;
  auth_code: string;
  refresh_token: string;
}

export interface Location {
  id: string;
  name: string;
  address: {
    address_line_1: string;
    address_line_2: string;
    locality: string;
    postal_code: string;
    country: string;
  };
  timezone: string;
  capabilities: string[];
  status: string;
  created_at: string;
  merchant_id: string;
  country: string;
  language_code: string;
  currency: string;
  business_name: string;
  type: string;
  website_url: string;
  business_hours: any;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  mcc: string;
}

export interface BusinessUpdate {
  name: string;
  location_id: string;
  currency: string;
}


export interface PlanVariation {
  id: number;
  name: string;
  type: string;
  amount: number;
  credit: number;
  status: string;
  cadence: string;
  plan_id: string;
  version: number;
  object_id: string;
  created_at: number;
  business_id: string;
  description: string;
  gift_credit: number;
  tax_percentage: number;
  credit_charge_amount: number;
  gift_credit_charge_amount: number;
}

export interface SubscriptionPlanData {
  plan_variations: PlanVariation[];
  subscription_plans: Array<{
    id: number;
    name: string;
    status: string;
    version: number;
    object_id: string;
    created_at: number;
    business_id: string;
    eligible_item_ids: any;
  }>;
}

export interface CreatePlanRequest {
  name: string;
  business_id: string;
}

export interface CreatePlanVariationRequest {
  plan_id: string;
  name: string;
  cadence: string;
  amount: number;
  type: string;
  business_id: string;
  credit: number;
  credit_charge_amount: number;
  description: string;
  tax_percentage: number;
  gift_credit: number;
  gift_credit_charge_amount: number;
}

class AuthService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  async signup(credentials: SignupCredentials): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    const token = data.authToken;
    this.setToken(token);
    return token;
  }

  async login(credentials: LoginCredentials): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    const token = data.authToken;
    this.setToken(token);
    return token;
  }

  async getMe(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get user info');
    }

    const user = await response.json();
    return user;
  }

  async logout(): Promise<void> {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async getBusiness(): Promise<Business> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/businesses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get business info');
    }

    const business = await response.json();
    return business;
  }

  async getLocations(): Promise<Location[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/location/list-locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get locations');
    }

    const locations = await response.json();
    return locations;
  }

  async updateBusiness(businessUpdate: BusinessUpdate): Promise<Business> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/businesses/update`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessUpdate),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update business');
    }

    const business = await response.json();
    return business;
  }

  async revokeSquareConnection(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/revoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to revoke Square connection');
    }
  }


  async getSubscriptionPlanVariations(businessId: string): Promise<SubscriptionPlanData> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${SUBSCRIPTION_API_BASE_URL}/client/subscription/subscription-variation?business_id=${businessId}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get subscription plan variations');
    }

    const data = await response.json();
    return data;
  }

  async createSubscriptionPlan(planData: CreatePlanRequest): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${SUBSCRIPTION_API_BASE_URL}/subscription/subscription-plan/create`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create subscription plan');
    }

    const result = await response.json();
    return result;
  }

  async createPlanVariation(variationData: CreatePlanVariationRequest): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${SUBSCRIPTION_API_BASE_URL}/subscription/plan_variation/create`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create plan variation');
    }

    const result = await response.json();
    return result;
  }
}

export const authService = new AuthService();
