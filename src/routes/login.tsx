import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import TextController from "../components/TextController";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  usernameOrEmail: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        navigate({ to: "/apps",replace: true });
      } catch (err) {
        console.error("Login error:", err);
        alert(`${err}`);
      } finally {
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-off-white dark:bg-dark-off-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-text-primary dark:text-dark-primary mb-8">
            Sign in to your account
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="usernameOrEmail"
            children={(field) => (
              <TextController
                field={field}
                label="Email" // Changed from "Username or Email"
                placeholder="Enter your email"
                type="email" // Changed to email type
                required
              />
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <TextController
                field={field}
                label="Password"
                placeholder="Enter password"
                type="password"
                required
              />
            )}
          />

          <div>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}
