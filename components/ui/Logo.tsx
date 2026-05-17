import Link from "next/link";

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 44, className = "" }: LogoIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Sort Cash"
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
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
      {onDark ? (
        <div className="bg-white rounded-xl flex items-center justify-center shrink-0 p-1">
          <LogoIcon size={34} />
        </div>
      ) : (
        <LogoIcon size={36} />
      )}
      <span className="text-xl font-bold tracking-tight text-navy leading-none">
        Sort<span className="text-accent">Cash</span>
      </span>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
