import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { login as apiLogin, register as apiRegister, getWallet } from "../api";
import type { User, RegisterRequest } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (
    data: RegisterRequest,
  ) => Promise<{ user: User; accessToken: string }>;
  logout: () => void;
  refreshWallet: () => Promise<void>;
  updateWalletBalance: (balance: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const res = await apiLogin({ email, password });
      const token = res.data.accessToken;
      const userData = res.data.user;

      if (!token) {
        throw new Error("Login response does not contain an access token.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    },
    [],
  );

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await apiRegister(data);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const refreshWallet = useCallback(async () => {
    const res = await getWallet();
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, walletBalance: res.data.balance };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateWalletBalance = useCallback((balance: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev!, walletBalance: balance };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshWallet,
        updateWalletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
