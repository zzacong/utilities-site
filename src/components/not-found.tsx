import { ExampleWrapper } from '@/components/example'
import { Card } from '@/components/ui/card'

import { CardDescription, CardHeader, CardTitle } from './ui/card'

export default function NotFound() {
  return (
    <ExampleWrapper>
      <Card className="col-span-2 mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-5xl">404</CardTitle>
          <CardDescription className="text-center text-xl">
            Page not found
          </CardDescription>
        </CardHeader>
      </Card>
    </ExampleWrapper>
  )
}
