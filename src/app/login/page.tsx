"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="flex flex-col items-center justify-center h-dvh">
      <form onSubmit={handleSubmit} className="max-w-md w-full px-4">
        <h1 className="text-3xl md:text-4xl font-bold">Welcome back 👋</h1>
        <div className="space-y-2 mt-10">
          <Label htmlFor="password">Enter your password</Label>
          <Input
            id="password"
            type="password"
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
    </div>
  );
};

export default LoginPage;
