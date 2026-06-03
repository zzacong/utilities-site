import { createFileRoute } from '@tanstack/react-router'
import { useDeferredValue, useMemo, useState } from 'react'
import OpenCC from 'opencc-js'

import CopyButton from '@/components/copy-button'
import { ExampleWrapper } from '@/components/example'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

const converters = {
  simplified: OpenCC.Converter({ from: 'tw', to: 'cn' }),
  traditional: OpenCC.Converter({ from: 'cn', to: 'tw' }),
}

export const Route = createFileRoute('/chinese-converter')({
  head: () => {
    return {
      meta: [
        { title: `Chinese Converter · Utilities` },
        {
          name: 'description',
          content:
            'Convert between Simplified and Traditional Chinese characters',
        },
      ],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ExampleWrapper>
      <ChineseConverterForm />
    </ExampleWrapper>
  )
}

function ChineseConverterForm() {
  const [inputText, setInputText] = useState('')
  const deferredInput = useDeferredValue(inputText)

  const convertedText = useMemo(() => {
    if (!deferredInput) {
      return {
        simplified: '',
        traditional: '',
      }
    }

    return {
      simplified: converters.simplified(deferredInput),
      traditional: converters.traditional(deferredInput),
    }
  }, [deferredInput])

  return (
    <>
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>输入 (Input)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="在此输入中文... (Enter Chinese text here...)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[300px] font-sans"
          />
        </CardContent>
      </Card>

      <OutputCard
        title="简体中文 (Simplified)"
        text={convertedText.simplified}
      />
      <OutputCard
        title="繁體中文 (Traditional)"
        text={convertedText.traditional}
      />
    </>
  )
}

type OutputCardProps = {
  title: string
  text: string
}

function OutputCard({ title, text }: OutputCardProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {text && <CopyButton text={text} />}
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={text}
          readOnly
          className="min-h-[300px] bg-muted font-sans"
        />
      </CardContent>
    </Card>
  )
}
