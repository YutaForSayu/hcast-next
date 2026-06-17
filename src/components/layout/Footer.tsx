import Link from "next/link";
import { BookOpen } from "lucide-react";

const links = {
  Browse: [
    { label: "All Series", href: "/browse" },
    { label: "Manga", href: "/browse?format=manga" },
    { label: "Manhwa", href: "/browse?format=manhwa" },
    { label: "Manhua", href: "/browse?format=manhua" },
  ],
  Genres: [
    { label: "Action", href: "/browse?genre=action" },
    { label: "Romance", href: "/browse?genre=romance" },
    { label: "Fantasy", href: "/browse?genre=fantasy" },
    { label: "Comedy", href: "/browse?genre=comedy" },
  ],
  Account: [
    { label: "Login", href: "/login" },
    { label: "Register", href: "/register" },
    { label: "Saved", href: "/saved" },
    { label: "History", href: "/history" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-16">
      <div className="hcast-container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <BookOpen size={15} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-text-primary">
                H<span className="text-accent">Cast</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-[200px]">
              Read manga, manhwa, and manhua for free. Updated daily.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-text-primary text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-text-muted hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-text-dim text-xs">
            © {new Date().getFullYear()} HCast. All rights reserved.
          </p>
          <p className="text-text-dim text-xs">
            Content sourced via API. All rights belong to respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
