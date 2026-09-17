import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginValues } from "@/schema/auth";
import { useLogin } from "@/services/auth/auth.service";

export function useLoginForm() {
  const navigate = useNavigate();
  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await login.mutateAsync(values);
    await navigate({ to: "/" });
  });

  return { form, onSubmit, login };
}
