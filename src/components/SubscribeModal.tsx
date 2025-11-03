"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";

const SubscribeModal = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname();
  const slug = pathname.split("/").pop() || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        body: JSON.stringify({ email, name, slug }),
      });
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
      }
      toast.success("Subscribed successfully");
      setEmail("");
      setName("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to subscribe",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="rounded-lg border border-stone-200 shadow-sm overflow-hidden mt-10"
      onSubmit={handleSubmit}
    >
      <div className="p-4 flex items-center justify-between bg-stone-100">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">Subscribe to my newsletter</h2>
          <p className="">
            Get these issues delivered straight to your inbox every week!
          </p>
        </div>
        <Button
          type="submit"
          disabled={isLoading || email.length === 0}
          variant="outline"
          size="sm"
        >
          {isLoading ? <Spinner /> : "Subscribe"}
        </Button>
      </div>
      <div className="p-4 border-t border-stone-200 grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="spiderman@newyork.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            Name (Optional)
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Peter Parker"
          />
        </div>
      </div>
    </form>
  );
};

export default SubscribeModal;
