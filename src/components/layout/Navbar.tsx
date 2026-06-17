"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Home,
  Grid3X3,
  TrendingUp,
  Bookmark,
  History,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/api";

export function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/browse", label: "Browse", icon: Grid3X3 },
    { href: "/browse?sort=popularity", label: "Top", icon: TrendingUp },
    { href: "/saved", label: "Saved", icon: Bookmark },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-bg/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/20"
          : "bg-transparent"
      )}
    >
      <div className="hcast-container">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                <BookOpen size={16} className="text-white" />
              </div>
            </div>
            <span className="font-display text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
              HC<span className="text-accent">ast</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === href
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className={cn(
              "relative ml-auto flex items-center transition-all duration-300",
              searchFocused ? "flex-1 max-w-sm" : "w-48 md:w-56"
            )}
          >
            <Search
              size={15}
              className={cn(
                "absolute left-3 transition-colors duration-200",
                searchFocused ? "text-accent" : "text-text-muted"
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search..."
              className="input-field pl-9 py-2 text-sm h-9"
            />
          </form>

          {/* User Section */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-elevated transition-colors duration-200"
              >
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-accent">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-text-secondary">
                  {user.username}
                </span>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-text-muted transition-transform duration-200 hidden sm:block",
                    isUserMenuOpen && "rotate-180"
                  )}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-xl shadow-card overflow-hidden animate-slide-down">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary">
                      {user.username}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/saved"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Bookmark size={14} />
                      Bookmarks
                    </Link>
                    <Link
                      href="/history"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <History size={14} />
                      History
                    </Link>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors w-full"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <User size={14} />
                Login
              </Link>
              <Link href="/register" className="btn-primary text-sm py-1.5 px-4">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors ml-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-bg-secondary border-t border-border animate-slide-down">
          <div className="hcast-container py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-accent/15 text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <User size={16} />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
