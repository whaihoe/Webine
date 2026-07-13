import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonLinkProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "outline" | "quiet";
  size?: "small" | "default";
  onClick?: () => void;
};

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "default",
  onClick,
}: ButtonLinkProps) {
  return (
    <Link
      className={`button-link button-link--${variant} button-link--${size}`}
      to={href}
      onClick={onClick}
    >
      <span>{children}</span>
      <span className="button-link__arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
