interface AuthCredentials {
  username: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  expiresAt?: number;
}

class AuthService {
  private readonly STORAGE_KEY = 'admin_auth';
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Default admin credentials (in production, these should be environment variables)
  private readonly ADMIN_CREDENTIALS = {
    username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
  };

  async login(credentials: AuthCredentials): Promise<boolean> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check credentials
      if (
        credentials.username === this.ADMIN_CREDENTIALS.username &&
        credentials.password === this.ADMIN_CREDENTIALS.password
      ) {
        const authState: AuthState = {
          isAuthenticated: true,
          token: this.generateToken(),
          expiresAt: Date.now() + this.SESSION_DURATION
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (!authData) return false;

      const authState: AuthState = JSON.parse(authData);
      
      // Check if token exists and hasn't expired
      if (!authState.token || !authState.expiresAt) return false;
      
      if (Date.now() > authState.expiresAt) {
        this.logout();
        return false;
      }

      return authState.isAuthenticated;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  getToken(): string | null {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (!authData) return null;

      const authState: AuthState = JSON.parse(authData);
      return authState.token || null;
    } catch (error) {
      console.error('Token retrieval error:', error);
      return null;
    }
  }

  private generateToken(): string {
    // Simple token generation for demo purposes
    // In production, use proper JWT or similar
    return btoa(Date.now().toString() + Math.random().toString());
  }

  // Check if session is about to expire (within 1 hour)
  isSessionExpiringSoon(): boolean {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (!authData) return false;

      const authState: AuthState = JSON.parse(authData);
      if (!authState.expiresAt) return false;

      const oneHour = 60 * 60 * 1000;
      return (authState.expiresAt - Date.now()) < oneHour;
    } catch (error) {
      return false;
    }
  }

  // Extend session
  extendSession(): boolean {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (!authData) return false;

      const authState: AuthState = JSON.parse(authData);
      authState.expiresAt = Date.now() + this.SESSION_DURATION;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
      return true;
    } catch (error) {
      console.error('Session extension error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
