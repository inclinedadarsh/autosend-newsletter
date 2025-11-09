import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { profileImage } from "@/assets";
import ModeToggle from "./ModeToggle";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between w-full max-w-2xl mx-auto px-5 md:px-0 py-10">
      <div className="flex items-center gap-2">
        <Link href="/">
          <ArrowLeftIcon />
        </Link>
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
