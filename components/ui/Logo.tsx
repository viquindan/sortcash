import Image from "next/image";
import Link from "next/link";

interface LogoIconProps {
  size?: number;
  className?: string;
  onDark?: boolean;
}

export function LogoIcon({ size = 44, className = "", onDark = false }: LogoIconProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="Sort Cash"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ mixBlendMode: onDark ? undefined : "multiply" }}
    />
  );

  if (onDark) {
    return (
      <div
        className="bg-white rounded-xl flex items-center justify-center shrink-0"
        style={{ width: size + 8, height: size + 8, padding: 4 }}
      >
        {img}
      </div>
    );
  }

  return img;
}

export function LogoFull({
  className = "",
  href,
  onDark = false,
}: {
  className?: string;
  href?: string;
  onDark?: boolean;
}) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={36} onDark={onDark} />
      <span className="text-xl font-bold tracking-tight text-navy leading-none">
        Sort<span className="text-accent">Cash</span>
      </span>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
