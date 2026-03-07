"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LoadingText } from "@/components/ui/loading-text";
import { MainLogo } from "@/components/ui/main-logo";

import { LOGIN_MUTATION } from "@/graphql/mutations/login";
import type { LoginUserInput, LoginResponse } from "@/__generated__/graphql";
import { loginSchema } from "../schemas/login.schema";

type LoginSchema = LoginUserInput;

export function LoginForm() {
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [login, { loading }] = useMutation<
    LoginResponse,
    { input: LoginUserInput }
  >(LOGIN_MUTATION);

  const onSubmit = (data: LoginSchema) => {
    login({
      variables: { input: data },
      onCompleted: () => {
        toast.success("Login successful");
        console.log("pushed to dashboard");
        router.push("/dashboard");
      },
      onError: (error) => {
        toast.error(error.message || "Login failed");
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Form {...form}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <MainLogo />
            <h1 className="text-xl font-bold">Welcome to SafeScreen</h1>
            <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            aria-label="Login form"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                      aria-describedby="email-error"
                    />
                  </FormControl>
                  <FormMessage
                    id="email-error"
                    className="text-red-600"
                    aria-live="polite"
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="current-password"
                      aria-describedby="password-error"
                    />
                  </FormControl>
                  <FormMessage
                    id="password-error"
                    className="text-red-600"
                    aria-live="polite"
                  />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              aria-live="polite"
            >
              {loading ? <LoadingText text="Logging in..." /> : "Login"}
            </Button>
          </form>
        </div>
      </Form>

      <p className="text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
