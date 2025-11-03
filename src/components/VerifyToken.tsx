"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function VerifyToken() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;

    const token = searchParams.get("verification-token");
    if (!token) return;

    processedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/subscribers/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));

        if (data?.ok) {
          toast.success("You're subscribed!", {
            description: "Thanks for confirming your email.",
          });
        } else {
          toast.error("Verification failed", {
            description: "The verification link is invalid or has expired.",
          });
        }
      } catch {
        toast.error("Verification failed", {
          description: "Something went wrong. Please try again.",
        });
      } finally {
        // Clean the URL to avoid re-triggering on refresh
        router.replace("/");
      }
    })();
  }, [router, searchParams]);

  return null;
}
