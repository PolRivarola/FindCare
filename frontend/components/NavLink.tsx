import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavLinkProps {
  href: string
  icon: LucideIcon
  children: React.ReactNode
  hasUnread?: boolean
}

export function NavLink({ href, icon: Icon, children, hasUnread }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-3 py-2 rounded-lg transition-all duration-200",
        "text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600",
        isActive && "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {hasUnread ? (
        <span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500" />
      ) : (
        <Icon className="mr-1 h-4 w-4" />
      )}
      {children}
    </Link>
  )
}
