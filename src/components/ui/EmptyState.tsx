import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-dim" />
      </div>
      <h3 className="font-display font-bold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-text-muted text-sm max-w-xs">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-4 btn-primary text-sm py-1.5 px-4"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
