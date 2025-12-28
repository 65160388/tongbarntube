import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      onClick={() => setIsActive(!isActive)}
      data-active={isActive}
      className={cn(
        "group p-6 rounded-2xl transition-all duration-500",
        "bg-card/30 backdrop-blur-sm border border-border/40",
        // Desktop Hover (only on devices that support hover)
        "[@media(hover:hover)]:hover:border-primary/30 [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:shadow-primary/20",
        "[@media(hover:hover)]:hover:-translate-y-2 [@media(hover:hover)]:hover:bg-gradient-to-br [@media(hover:hover)]:hover:from-primary/5 [@media(hover:hover)]:hover:to-transparent",
        // Active State (Mobile/Touch Toggle)
        "data-[active=true]:border-primary/30 data-[active=true]:shadow-xl data-[active=true]:shadow-primary/20",
        "data-[active=true]:-translate-y-2 data-[active=true]:bg-gradient-to-br data-[active=true]:from-primary/5 data-[active=true]:to-transparent",
        "cursor-pointer"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 text-primary transition-all duration-500",
        // Desktop Hover (only on devices that support hover)
        "[@media(hover:hover)]:group-hover:scale-125 [@media(hover:hover)]:group-hover:rotate-12 [@media(hover:hover)]:group-hover:shadow-lg [@media(hover:hover)]:group-hover:shadow-primary/30",
        // Active State
        "group-data-[active=true]:scale-125 group-data-[active=true]:rotate-12 group-data-[active=true]:shadow-lg group-data-[active=true]:shadow-primary/30"
      )}>
        <Icon className={cn(
          "w-6 h-6 text-primary",
          // Desktop Hover (only on devices that support hover)
          "[@media(hover:hover)]:group-hover:animate-pulse-glow",
          // Active State
          "group-data-[active=true]:animate-pulse-glow"
        )} />
      </div>
      <h3 className={cn(
        "text-lg font-semibold mb-2 transition-colors duration-300",
        "[@media(hover:hover)]:group-hover:text-primary",
        "group-data-[active=true]:text-primary"
      )}>{title}</h3>
      <p className={cn(
        "text-muted-foreground text-sm leading-relaxed transition-colors duration-300",
        "[@media(hover:hover)]:group-hover:text-foreground/80",
        "group-data-[active=true]:text-foreground/80"
      )}>{description}</p>
    </div>
  );
}
