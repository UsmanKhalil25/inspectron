import { EarthLock } from "lucide-react";

export function LangGraphLogoSVG({
  className,
  width,
  height,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <EarthLock
      className={className}
      width={width}
      height={height}
    />
  );
}
