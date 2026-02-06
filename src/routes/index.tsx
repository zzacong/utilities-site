import { createFileRoute, redirect } from '@tanstack/react-router'

// import { ExampleWrapper } from '@/components/example'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/kebab-case' })
  },
  // component: RouteComponent,
})

// function RouteComponent() {
//   return (
//     <ExampleWrapper>
//       <h1>UTIL</h1>
//     </ExampleWrapper>
//   )
// }
