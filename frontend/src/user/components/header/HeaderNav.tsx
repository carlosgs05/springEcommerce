import React from "react";
import { Link } from "react-router-dom";

export interface Tab {
  id: string;
  label: string;
  href: string;
  roles?: number[];
}

interface HeaderNavProps {
  tabs: Tab[];
  isActive: (path: string) => boolean;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

const HeaderNav: React.FC<HeaderNavProps> = ({
  tabs,
  isActive,
  onNavigate,
  variant = "desktop",
}) => {
  const getLinkClasses = (path: string) => {
    if (variant === "mobile") {
      const base = "block px-4 py-3 transition-all duration-200 cursor-pointer rounded-control";
      const active = isActive(path)
        ? "text-primary bg-surface"
        : "text-text-muted";
      const hover = "hover:text-primary hover:bg-surface";
      return `${base} ${active} ${hover}`;
    }
    const base = "px-3 py-2 transition-all duration-200 cursor-pointer";
    const active = isActive(path) ? "text-primary font-medium" : "text-text-muted";
    const hover = "hover:text-primary";
    return `${base} ${active} ${hover}`;
  };

  const listClasses =
    variant === "mobile"
      ? "flex flex-col space-y-1 mb-3"
      : "hidden md:flex items-center space-x-1 bg-surface/80 rounded-control px-2 py-1.5";

  return (
    <ul className={listClasses}>
      {tabs.map((tab) => (
        <li key={tab.id}>
          <Link to={tab.href} onClick={onNavigate} className={getLinkClasses(tab.href)}>
            {tab.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default HeaderNav;
