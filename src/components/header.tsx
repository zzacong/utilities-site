import { Link } from '@tanstack/react-router'
import { Hammer, Menu } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

const navItems = [
  { to: '/kebab-case', label: 'Kebab case' },
  { to: '/character-count', label: 'Character count' },
  { to: '/chinese-converter', label: 'Chinese converter' },
  { to: '/tsx-to-svg', label: 'TSX to SVG' },
  { to: '/svg-to-tsx', label: 'SVG to TSX' },
] as const

/**
 * Site header. Desktop shows the full link row, mobile collapses it into a
 * dropdown so the bar stays a single row on narrow screens.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-2 bg-background px-4 py-2 text-foreground shadow-md">
      <Button
        nativeButton={false}
        variant="ghost"
        size="icon-lg"
        className="hidden md:inline-flex"
        render={
          <Link to="/">
            <Hammer />
          </Link>
        }
      />

      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.to}>
              <NavigationMenuLink
                render={
                  <Link to={item.to} activeProps={{ 'data-state': 'active' }}>
                    {item.label}
                  </Link>
                }
              />
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-lg" className="md:hidden">
              <Menu />
              <span className="sr-only">Open navigation</span>
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="min-w-52">
          {navItems.map((item) => (
            <DropdownMenuItem
              key={item.to}
              className="px-2.5 py-1.5"
              render={
                <Link
                  to={item.to}
                  activeProps={{ className: 'bg-muted font-medium' }}
                >
                  {item.label}
                </Link>
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex justify-end">
        <ModeToggle />
      </div>
    </header>
  )
}
