import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/types";
import api from "@/utils/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

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

  async function register(email: string, password: string, name: string) {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
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
        user.value = response.data;
      })
      .catch(() => {
        logout();
      });
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };
});
