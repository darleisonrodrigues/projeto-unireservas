import { auth } from '@/config/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:8000/api';

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    user_type: 'student' | 'advertiser';
  };
}

export type UserProfile = AuthResponse['user'];

class AuthService {
  private token: string | null = null;
  private user: UserProfile | null = null;
  private firebaseUser: User | null = null;

  constructor() {
    this.initializeFromStorage();

    onAuthStateChanged(auth, (user) => {
      this.firebaseUser = user;
    });
  }

  private initializeFromStorage(): void {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user_profile');

    if (storedToken && storedUser) {
      console.log('Sessão restaurada do localStorage.');
      this.token = storedToken;
      this.user = JSON.parse(storedUser);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Email ou senha inválidos.');
      }

      const data: AuthResponse = await response.json();
      this.token = data.access_token;
      this.user = data.user;

      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user_profile', JSON.stringify(this.user));

      return data;
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      let errorMessage = 'Falha no login.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
    console.log('Logout realizado com sucesso.');
  }

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): UserProfile | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// A instancia é criada e exportada aqui
export const authService = new AuthService();