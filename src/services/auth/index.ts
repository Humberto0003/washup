export type AuthRole = "ADMIN" | "VISITOR";

export type AuthUser = {
  name: string;
  role: AuthRole;
};

export const AUTH_STORAGE_KEY = "authUser";

const adminUser: AuthUser = {
  name: "Administrador WashUp",
  role: "ADMIN",
};

export function getAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
}

export function login(email: string, password: string) {
  if (email === "admin@washup.com" && password === "123456") {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  return null;
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function canManageQueue(user: AuthUser | null) {
  return user?.role === "ADMIN";
}
