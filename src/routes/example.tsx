import { createFileRoute } from '@tanstack/react-router'

import { ComponentExample } from '@/components/component-example'

export const Route = createFileRoute('/example')({
  head: () => {
    return {
      meta: [{ title: `Example component` }],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <ComponentExample />
}
