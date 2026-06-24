import { cn } from "@/lib/utils";
import { FaGooglePlay } from "react-icons/fa6";

interface PlayStoreBadgeProps {
  href: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function PlayStoreBadge({
  href,
  className,
  size = "md",
}: PlayStoreBadgeProps) {
  const heights = { sm: "h-10", md: "h-12", lg: "h-16" };
  const iconSizes = { sm: 20, md: 24, lg: 30 };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-3 bg-black text-white px-5 rounded-xl font-medium hover:bg-zinc-900 active:scale-95 transition-all hover:scale-105",
        heights[size],
        className
      )}
      aria-label="Get VideoInvoice on Google Play"
    >
      <FaGooglePlay size={iconSizes[size]} className="flex-shrink-0" />
      <div className="text-left leading-tight">
        <div className="text-[10px] opacity-60">GET IT ON</div>
        <div className="text-base font-semibold -mt-0.5">Google Play</div>
      </div>
    </a>
  );
}
