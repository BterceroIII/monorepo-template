import { useLoginForm } from "@/features/auth/hooks/use-login-form";
import { getApiErrorMessage } from "@/services/api";

export function LoginPage() {
  const { form, onSubmit, login } = useLoginForm();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold">Iniciar sesión</h1>
          <p className="text-sm text-muted-foreground">
            Accede a tu cuenta para continuar.
          </p>
        </div>

        <label className="block space-y-1 text-sm">
          <span>Correo</span>
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
          {errors.email && (
            <span className="text-xs text-destructive">
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="block space-y-1 text-sm">
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
          {errors.password && (
            <span className="text-xs text-destructive">
              {errors.password.message}
            </span>
          )}
        </label>

        {login.isError && (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(login.error)}
          </p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-60"
        >
          {login.isPending ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
