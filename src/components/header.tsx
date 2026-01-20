import { Link } from '@tanstack/react-router'
import { Hammer } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-2 bg-background px-4 py-2 text-foreground shadow-md">
      <Button
        nativeButton={false}
        variant="ghost"
        size="icon-lg"
        render={
          <Link to="/">
            <Hammer />
          </Link>
        }
      />
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={
                <Link to="/kebab-case" activeProps={{ 'data-state': 'active' }}>
                  Kebab case
                </Link>
              }
            />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={
                <Link
                  to="/character-count"
                  activeProps={{ 'data-state': 'active' }}
                >
                  Character count
                </Link>
              }
            />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex flex-1 justify-end">
        <ModeToggle />
      </div>
    </header>
  )
}
