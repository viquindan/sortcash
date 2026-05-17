import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 32, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Sort Cash"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function LogoFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={32} />
      <span className="text-xl font-bold tracking-tight text-navy leading-none">
        Sort<span className="text-accent">Cash</span>
      </span>
    </div>
  );
}
