import { createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useMemo, useState } from 'react'

import CopyButton from '@/components/copy-button'
import { ExampleWrapper } from '@/components/example'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { convertSvgToTsx } from '@/lib/svg-to-tsx'

export const Route = createFileRoute('/svg-to-tsx')({
  head: () => {
    return {
      meta: [
        { title: `SVG to TSX · Utilities` },
        {
          name: 'description',
          content: 'Convert an SVG into a React JSX svg element',
        },
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ExampleWrapper>
      <SvgToTsxForm />
    </ExampleWrapper>
  )
}

function SvgToTsxForm() {
  const [inputText, setInputText] = useState('')
  const deferredInput = useDeferredValue(inputText)

  const result = useMemo(
    () => (deferredInput.trim() ? convertSvgToTsx(deferredInput) : undefined),
    [deferredInput],
  )
  const jsx = result?.ok ? result.svg : ''
  const error = result?.ok === false ? result.error : undefined

  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>SVG input</CardTitle>
          <CardDescription>
            Paste an SVG. Output is the JSX svg element for a React component
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            placeholder='<svg xmlns="http://www.w3.org/2000/svg" ...>'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-invalid={error !== undefined}
            className="min-h-[300px] font-mono text-xs md:text-xs"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error.message}
            </p>
          )}
        </CardContent>
      </Card>

      {jsx && (
        <>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border p-4">
                <img
                  alt="Pasted SVG preview"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(deferredInput)}`}
                  className="max-h-48 max-w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>JSX output</CardTitle>
                <CopyButton text={jsx} />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                {jsx}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
