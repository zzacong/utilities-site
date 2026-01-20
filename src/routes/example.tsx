import { createFileRoute, notFound } from '@tanstack/react-router'

import { ComponentExample } from '@/components/component-example'

export const Route = createFileRoute('/example')({
  head: () => {
    return {
      meta: [{ title: `Example component` }],
    }
  },
  loader: () => {
    // throw notFound()
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <ComponentExample />
}
