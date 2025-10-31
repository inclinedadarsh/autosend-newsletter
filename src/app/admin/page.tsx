"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to logout");
      }

      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <h1 className="text-2xl font-bold">Admin Page</h1>
      <Button variant="destructive" onClick={handleLogout} className="mt-4">
        <LogOutIcon size={16} /> Logout
      </Button>
    </div>
  );
};

export default AdminPage;
