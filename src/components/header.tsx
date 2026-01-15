import { Link } from '@tanstack/react-router'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 flex items-center gap-4 bg-background p-4 text-white shadow-md">
      <h1 className="font-mono text-lg font-semibold text-foreground">
        <Link to="/">Utilities</Link>
      </h1>
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
