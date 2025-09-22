import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider
} from "firebase/auth";
import { auth } from "@/config/firebase";

// Base URL da API
const API_BASE_URL = "http://localhost:8000/api/auth-firebase"; // as vezes e http://localhost:8000/api/auth-firebase

// Interfaces
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: "student" | "advertiser";
  university?: string;
  companyName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    userType: "student" | "advertiser";
    firebase_uid?: string;
    profileImage?: string;
    profile_image?: string;
    companyName?: string;
    company_name?: string;
    phone?: string;
    verified?: boolean;
    university?: string;
    course?: string;
    semester?: string;
    bio?: string;
    cnpj?: string;
    description?: string;
    address?: string;
    website?: string;
    rating?: number;
    totalProperties?: number;
    total_properties?: number;
    favoriteProperties?: string[];
    favorite_properties?: string[];
    properties?: string[];
    preferences?: {
      budget?: string;
      roomType?: 'kitnet' | 'quarto' | 'apartamento';
      amenities?: string[];
      location?: string;
      maxDistance?: number;
    };
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

class AuthFirebaseService {
  private currentUser: User | null = null;
  private userProfile: AuthResponse["user"] | null = null;

  constructor() {
    this.initializeFromStorage();
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.fetchUserProfile();
      } else {
        this.userProfile = null;
        this.clearTokens();
      }
    });
  }

  private initializeFromStorage(): void {
    const token = this.getToken();
    const storedProfile = localStorage.getItem("user_profile");
    if (token && storedProfile) {
      this.verifyToken().then(res => {
        if (res.valid) {
          this.userProfile = JSON.parse(storedProfile);
          console.log("✅ Sessão restaurada do storage.");
        } else {
          this.clearTokens();
        }
      });
    }
  }

  // Registrar novo usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log("[REGISTER] Iniciando registro:", data.email);
      console.log("[REGISTER] Criando usuário no Firebase Auth...");
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(userCredential.user, {
        displayName: data.name
      });

      console.log("[REGISTER] Usuário criado no Firebase Auth:", userCredential.user.uid);

      // registrar no backend com firebase_uid real
      const registrationData = {
        ...data,
        firebase_uid: userCredential.user.uid
      };

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });
      console.log("[REGISTER] Resposta do backend:", response.status);

      const result: ApiResponse<{ user: AuthResponse["user"]; firebase_uid: string }> =
        await response.json().catch(() => ({ success: false, message: "Erro ao parsear resposta" }));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro no registro");
      }

      console.log("[REGISTER] Usuário registrado no backend");

      // Usuario ja esta autenticado (nao precisa fazer login)
      console.log("[REGISTER] Autenticado no Firebase:", userCredential.user.uid);

      this.currentUser = userCredential.user;
      const idToken = await getIdToken(userCredential.user, true);
      console.log("[REGISTER] Novo ID Token gerado:", idToken.substring(0, 25) + "...");

      localStorage.setItem("firebase_token", idToken);
      localStorage.setItem("user_profile", JSON.stringify(result.data!.user));
      this.userProfile = result.data!.user;

      console.log("[REGISTER] Registro + login concluído");

      return { user: result.data!.user };
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido durante o registro.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("[REGISTER] Erro:", error);
      throw new Error(errorMessage);
    }
  }

  // Fazer login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("[LOGIN] Iniciando login Firebase:", credentials.email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      console.log("[LOGIN] Autenticado no Firebase:", userCredential.user.uid);

      this.currentUser = userCredential.user;

      console.log("[LOGIN] Gerando novo ID Token...");
      const idToken = await getIdToken(userCredential.user, true);
      console.log("[LOGIN] Novo ID Token gerado:", idToken.substring(0, 25) + "...");

      console.log("[LOGIN] Enviando token para backend /verify-token...");
      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log("[LOGIN] Resposta do backend:", response.status);

      if (response.status === 401 || response.status === 403) {
        const text = await response.text();
        console.error("[LOGIN] verify-token não autorizado:", response.status, text);
        throw new Error("Token inválido ou expirado. Faça login novamente.");
      }

      console.log("[LOGIN] Tentando parsear resposta JSON...");
      let result: ApiResponse<{ valid: boolean; user: AuthResponse["user"] }>;
      try {
        result = await response.json();
        console.log("[LOGIN] JSON parseado:", result);
      } catch (err) {
        console.error("[LOGIN] Erro ao parsear JSON:", err);
        throw new Error("Resposta inesperada do servidor ao verificar token.");
      }

      if (!response.ok) {
        const msg = result.message || "Erro ao verificar token no backend";
        throw new Error(msg);
      }

      if (!result.success || !result.data?.valid) {
        throw new Error(result.message || "Usuário não encontrado no sistema");
      }

      localStorage.setItem("firebase_token", idToken);
      localStorage.setItem("user_profile", JSON.stringify(result.data.user));
      this.userProfile = result.data.user;

      console.log("[LOGIN] Login completo e verificado no backend");

      return { user: result.data.user };
    } catch (error: unknown) {
      let errorMessage = "Ocorreu um erro desconhecido durante o login.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("[LOGIN] Erro:", error);
      throw new Error(errorMessage);
    }
  }

  // Login com Google
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      console.log("[GOOGLE LOGIN] Iniciando login com Google...");

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const userCredential = await signInWithPopup(auth, provider);
      console.log("[GOOGLE LOGIN] Autenticado no Firebase:", userCredential.user.uid);

      return await this.handleSocialLogin(userCredential.user, 'google');
    } catch (error: unknown) {
      console.error("[GOOGLE LOGIN] Erro:", error);
      throw new Error("Erro ao fazer login com Google");
    }
  }

  // Login com Apple
  async loginWithApple(): Promise<AuthResponse> {
    try {
      console.log("[APPLE LOGIN] Iniciando login com Apple...");

      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const userCredential = await signInWithPopup(auth, provider);
      console.log("[APPLE LOGIN] Autenticado no Firebase:", userCredential.user.uid);

      return await this.handleSocialLogin(userCredential.user, 'apple');
    } catch (error: unknown) {
      console.error("[APPLE LOGIN] Erro:", error);

      // Verificar se é erro de operação não permitida (provedor não configurado)
      if (error instanceof Error && error.message.includes('auth/operation-not-allowed')) {
        throw new Error("Login com Apple não está configurado. Entre em contato com o administrador.");
      }

      throw new Error("Erro ao fazer login com Apple. Tente novamente.");
    }
  }

  // Método privado para lidar com login social
  private async handleSocialLogin(user: User, provider: 'google' | 'apple'): Promise<AuthResponse> {
    try {
      this.currentUser = user;

      // Gerar token
      const idToken = await getIdToken(user, true);
      console.log("[SOCIAL LOGIN] Token gerado:", idToken.substring(0, 25) + "...");

      // Verificar se usuário já existe no backend
      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        // Usuário já existe, fazer login normal
        const result: ApiResponse<{ valid: boolean; user: AuthResponse["user"] }> = await response.json();

        if (result.success && result.data?.valid) {
          localStorage.setItem("firebase_token", idToken);
          localStorage.setItem("user_profile", JSON.stringify(result.data.user));
          this.userProfile = result.data.user;

          console.log("[SOCIAL LOGIN] Usuário existente logado");
          return { user: result.data.user };
        }
      }

      // Usuário não existe, criar conta automaticamente
      console.log("[SOCIAL LOGIN] Criando nova conta para usuário social");

      const registrationData: RegisterData & { firebase_uid: string } = {
        name: user.displayName || `Usuário ${provider}`,
        email: user.email || `${user.uid}@${provider}.com`,
        password: "", // Senha vazia para detectar login social
        userType: "student", // Padrão para login social
        firebase_uid: user.uid,
        university: "UNIFOR" // Campo obrigatório para estudantes
      };

      console.log("[SOCIAL LOGIN] Dados de registro:", registrationData);

      const registerResponse = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const registerResult: ApiResponse<{ user: AuthResponse["user"] }> = await registerResponse.json();

      if (!registerResponse.ok || !registerResult.success) {
        throw new Error(registerResult.message || "Erro ao criar conta social");
      }

      localStorage.setItem("firebase_token", idToken);
      localStorage.setItem("user_profile", JSON.stringify(registerResult.data!.user));
      this.userProfile = registerResult.data!.user;

      console.log("[SOCIAL LOGIN] Nova conta criada e logada");
      return { user: registerResult.data!.user };

    } catch (error: unknown) {
      console.error("[SOCIAL LOGIN] Erro:", error);
      throw error;
    }
  }

  // Fazer logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.clearTokens();
      this.userProfile = null;
      this.currentUser = null;
      console.log("[LOGOUT] Logout realizado");
    } catch (error: unknown) {
      console.error("[LOGOUT] Erro:", error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.userProfile;
  }

  getToken(): string | null {
    return localStorage.getItem("firebase_token");
  }

  getCurrentUser(): AuthResponse["user"] | null {
    return this.userProfile;
  }

  async fetchUserProfile(): Promise<AuthResponse["user"] | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result: ApiResponse<AuthResponse["user"]> = await response.json();

      if (response.ok && result.success && result.data) {
        this.userProfile = result.data;
        localStorage.setItem("user_profile", JSON.stringify(result.data));
        return result.data;
      }

      return null;
    } catch (error: unknown) {
      console.error("[PROFILE] Erro ao buscar perfil:", error);
      return null;
    }
  }

  async verifyToken(): Promise<{ valid: boolean; user?: AuthResponse["user"] }> {
    try {
      const token = this.getToken();
      if (!token) return { valid: false };

      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result: ApiResponse<{ valid: boolean; user: AuthResponse["user"] }> =
        await response.json();

      if (response.ok && result.success && result.data?.valid) {
        localStorage.setItem("user_profile", JSON.stringify(result.data.user));
        this.userProfile = result.data.user;
        return { valid: true, user: result.data.user };
      }

      this.clearTokens();
      return { valid: false };
    } catch (error: unknown) {
      console.error("[VERIFY] Erro na verificação do token:", error);
      this.clearTokens();
      return { valid: false };
    }
  }

    async refreshToken(): Promise<string | null> {
    try {
      if (this.currentUser) {
        const newToken = await getIdToken(this.currentUser, true);
        localStorage.setItem("firebase_token", newToken);
        console.log("[REFRESH] Token atualizado:", newToken.substring(0, 25) + "...");
        return newToken;
      }
      return null;
    } catch (error: unknown) {
      console.error("[REFRESH] Erro ao atualizar token:", error);
      return null;
    }
  }

  // Verificar se um provedor social está disponível
  async isProviderAvailable(providerId: 'google.com' | 'apple.com'): Promise<boolean> {
    try {
      if (providerId === 'google.com') {
        new GoogleAuthProvider();
        return true;
      } else if (providerId === 'apple.com') {
        new OAuthProvider('apple.com');
        return true;
      }
      return false;
    } catch (error) {
      console.log(`Provider ${providerId} não disponível:`, error);
      return false;
    }
  }

  private clearTokens(): void {
    localStorage.removeItem("firebase_token");
    localStorage.removeItem("user_profile");
    console.log("Tokens e perfil removidos do storage.");
  }
}

export const authFirebaseService = new AuthFirebaseService();