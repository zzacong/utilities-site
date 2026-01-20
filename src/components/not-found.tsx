import { ExampleWrapper } from '@/components/example'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default function NotFound() {
  return (
    <ExampleWrapper>
      <Empty className="col-span-2 mx-auto w-full max-w-2xl border border-dashed">
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </ExampleWrapper>
  )
}
