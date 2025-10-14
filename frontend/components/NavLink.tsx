import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  hasUnread?: boolean;
}

export function NavLink({ href, icon: Icon, children, hasUnread }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className="text-gray-600 hover:text-white flex items-center px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
    >
      {hasUnread ? (
        <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2" />
      ) : (
        <Icon className="h-4 w-4 mr-1" />
      )}
      {children}
    </Link>
  );
}
