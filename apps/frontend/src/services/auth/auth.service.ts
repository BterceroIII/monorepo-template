import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/services/api";

export type UserRole = "ADMIN" | "USER";

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthMessageResponse = {
  message: string;
};

export const currentUserQueryKey = ["auth", "user"] as const;

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthMessageResponse>("/auth/login", input);
  return data;
}

export async function logout() {
  const { data } = await api.post<AuthMessageResponse>("/auth/logout");
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get<CurrentUser>("/auth/user");
  return data;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    retry: false,
  });
}
