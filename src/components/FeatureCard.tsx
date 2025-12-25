import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group p-6 rounded-2xl transition-all duration-500",
        "bg-card/30 backdrop-blur-sm border border-border/40 hover:border-primary/30",
        "shadow-sm hover:shadow-xl hover:shadow-primary/20",
        "hover:-translate-y-2 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent",
        "cursor-pointer"
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 text-primary group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/30">
        <Icon className="w-6 h-6 text-primary group-hover:animate-pulse-glow" />
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">{description}</p>
    </div>
  );
}
