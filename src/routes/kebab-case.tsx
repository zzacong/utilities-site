import { createFileRoute } from '@tanstack/react-router'

import KebabCaseConverter from '@/components/kebab-case-converter'

export const Route = createFileRoute('/kebab-case')({ component: App })

function App() {
  return <KebabCaseConverter />
}
