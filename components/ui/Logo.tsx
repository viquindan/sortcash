import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 44, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Sort Cash"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", background: "transparent" }}
    />
  );
}

export function LogoFull({
  className = "",
  href,
}: {
  className?: string;
  href?: string;
}) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={44} />
      <span className="text-xl font-bold tracking-tight text-navy leading-none">
        Sort<span className="text-accent">Cash</span>
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
