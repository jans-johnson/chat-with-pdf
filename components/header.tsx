"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="w-full flex h-14 items-center justify-between px-6 bg-white/80 dark:bg-black/50 backdrop-blur-xl border-b border-neutral-200 dark:border-white/5 shrink-0">
      {/* Logo and Brand */}
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src="/pdfwizard-logo.svg"
          alt="PdfWizard Logo"
          width={160}
          height={44}
          priority={false}
          className="w-[140px] h-auto hidden dark:block"
        />
        <Image
          src="/pdfwizard-logo-dark.svg"
          alt="PdfWizard Logo"
          width={160}
          height={44}
          priority={false}
          className="w-[140px] h-auto block dark:hidden"
        />
      </Link>

      {/* Navigation and Actions */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
