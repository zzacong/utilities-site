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
import { convertTsxToSvg } from '@/lib/tsx-to-svg'

export const Route = createFileRoute('/tsx-to-svg')({
  head: () => {
    return {
      meta: [
        { title: `TSX to SVG · Utilities` },
        {
          name: 'description',
          content: 'Convert a React TSX icon component into pure SVG',
        },
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ExampleWrapper>
      <TsxToSvgForm />
    </ExampleWrapper>
  )
}

function TsxToSvgForm() {
  const [inputText, setInputText] = useState('')
  const deferredInput = useDeferredValue(inputText)

  const result = useMemo(
    () => (deferredInput.trim() ? convertTsxToSvg(deferredInput) : undefined),
    [deferredInput],
  )
  const svg = result?.ok ? result.svg : ''
  const error = result?.ok === false ? result.error : undefined

  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>TSX input</CardTitle>
          <CardDescription>
            Paste a React icon component or a bare &lt;svg&gt; JSX element
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            placeholder="export default function Icon(props) { return (<svg ...>) }"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            aria-invalid={error !== undefined}
            className="min-h-[300px] font-mono text-xs md:text-xs"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error.line !== undefined ? `Line ${error.line}: ` : ''}
              {error.message}
            </p>
          )}
        </CardContent>
      </Card>

      {svg && (
        <>
          <Card className="col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SVG output</CardTitle>
                <CopyButton text={svg} />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                {svg}
              </pre>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border p-4">
                <img
                  alt="Converted SVG preview"
                  src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
                  className="max-h-48 max-w-full"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  )
}
