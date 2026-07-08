"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, User as UserIcon, Trophy } from "lucide-react";
import { useAppStore } from "@/lib/store";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import NotificationsBell from "./NotificationsBell";
import Button from "./ui/Button";

export default function Header() {
  const t = useTranslations("Common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser());

  const navLinks = currentUser
    ? [
        { href: "/dashboard", label: t("dashboard") },
        { href: "/predictions", label: t("predictions") },
        { href: "/profile", label: t("profile") },
        ...(currentUser.isAdmin ? [{ href: "/admin", label: t("admin") }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 bg-header text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Trophy size={16} />
          </span>
          {t("appName")}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {currentUser && <NotificationsBell />}
          <LanguageSwitcher />
          <ThemeToggle />
          {currentUser ? (
            <Link
              href="/profile"
              className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-primary-foreground"
            >
              {currentUser.avatarPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.avatarPhotoUrl} alt={currentUser.name} className="h-9 w-9 object-cover" />
              ) : (
                currentUser.name.slice(0, 2).toUpperCase()
              )}
            </Link>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm" className="text-white hover:text-white">
                {t("login")}
              </Button>
              <Button href="/register" size="sm">
                {t("register")}
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            {!currentUser && (
              <div className="mt-2 flex gap-2">
                <Button href="/login" variant="outline" size="sm" className="flex-1 border-white/20 text-white">
                  {t("login")}
                </Button>
                <Button href="/register" size="sm" className="flex-1">
                  {t("register")}
                </Button>
              </div>
            )}
            {currentUser && (
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">
                <UserIcon size={16} /> {currentUser.name}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between px-1">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
