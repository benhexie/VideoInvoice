import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function GradientText({ children, className, style }: GradientTextProps) {
  return (
    <span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: "linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #7C3AED 100%)",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
