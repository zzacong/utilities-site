import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 flex items-center gap-2 bg-background p-4 text-white shadow-md">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        render={
          <Link to="/">
            <img src="/hammer.svg" alt="Utilities Logo" className="h-6 w-6" />
          </Link>
        }
      />
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link to="/kebab-case">Kebab case</Link>}
            />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  )
}
