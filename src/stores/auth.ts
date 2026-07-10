import { defineStore } from "pinia";
import { ref, computed, markRaw } from "vue";
import type { User } from "@/types";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  /** True once the init GET /auth/user has settled (or no token was stored). */
  const initialized = ref(false);
  let resolveReady!: () => void;
  // markRaw: pinia wraps the store in reactive(), and awaiting a
  // reactive-proxied Promise throws — the promise must stay raw.
  const ready = markRaw(
    new Promise<void>((resolve) => {
      resolveReady = resolve;
    }),
  );

  function markReady() {
    initialized.value = true;
    resolveReady();
  }

  async function login(username: string, password: string) {
    try {
      const response = await api.post("/auth/login", { username, password });
      token.value = response.data.token;
      user.value = response.data.user;
      if (token.value) {
        localStorage.setItem("token", token.value);
      }
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async function register(email: string, password: string, username: string) {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        username,
      });
      token.value = response.data.token;
      user.value = response.data.user;
      if (token.value) {
        localStorage.setItem("token", token.value);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    token.value = storedToken;
    api
      .get("/auth/user")
      .then((response) => {
        // GET /auth/user returns AuthResponse { token, user } — pull out user.
        user.value = response.data.user;
      })
      .catch(() => {
        logout();
      })
      .finally(markReady);
  } else {
    markReady();
  }

  return {
    user,
    isAuthenticated,
    initialized,
    ready,
    login,
    register,
    logout,
  };
});
