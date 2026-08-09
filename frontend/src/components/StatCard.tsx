import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-md p-4 flex flex-col justify-between h-28">
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium text-light-muted dark:text-dark-muted uppercase tracking-wide">
          {title}
        </p>
        <Icon className="w-4 h-4 text-light-muted dark:text-dark-muted" />
      </div>
      <p className="text-2xl font-semibold text-light-text dark:text-dark-text">
        {value}
      </p>
    </div>
  );
}
