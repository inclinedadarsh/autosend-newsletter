"use client";

import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profileImage } from "@/assets";
import ModeToggle from "./ModeToggle";

const Navbar = () => {
  const pathname = usePathname();

  const getBackLink = () => {
    if (pathname === "/") {
      return null; // No link on home page
    }
    if (pathname === "/issues" || pathname.startsWith("/issues/")) {
      return "/";
    }
    if (pathname === "/admin") {
      return "/";
    }
    if (pathname === "/admin/new" || pathname.startsWith("/admin/edit/")) {
      return "/admin";
    }
    return "/"; // Default fallback
  };

  const backLink = getBackLink();

  return (
    <nav className="flex items-center justify-between w-full max-w-2xl mx-auto px-5 md:px-0 py-10">
      <div className="flex items-center gap-2">
        {backLink && (
          <Link href={backLink}>
            <ArrowLeftIcon />
          </Link>
        )}
        <Image
          src={profileImage}
          alt="Profile"
          className="size-8 rounded-full"
        />
      </div>
      <ModeToggle />
    </nav>
  );
};

export default Navbar;
