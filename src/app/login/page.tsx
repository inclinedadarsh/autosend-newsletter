"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const LoginPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Invalid password");
      }

      toast.success("Logged in successfully");

      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md w-full border rounded-lg overflow-hidden mx-auto mt-16"
    >
      <div className="p-4 space-y-2">
        <h1 className="text-3xl font-semibold">Welcome back 👋</h1>
        <p className="text-muted-foreground">
          Please enter the password you setup for the admin panel.
        </p>
      </div>
      <div className="space-y-2 p-4 border-t">
        <Input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          disabled={isLoading || password.length === 0}
          className="w-full"
        >
          {isLoading ? <Spinner /> : "Log in to your account"}
        </Button>
      </div>
    </form>
  );
};

export default LoginPage;
