import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import OpenCC from 'opencc-js'

import CopyButton from '@/components/copy-button'
import { ExampleWrapper } from '@/components/example'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

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

  // Initialize converters
  const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' })
  const t2sConverter = OpenCC.Converter({ from: 'tw', to: 'cn' })

  // Derive both outputs from input
  const simplifiedText = inputText ? t2sConverter(inputText) : ''
  const traditionalText = inputText ? s2tConverter(inputText) : ''

  return (
    <>
      {/* Input Card - Full Width */}
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

      {/* Simplified Output Card - Left */}
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>简体中文 (Simplified)</CardTitle>
            {simplifiedText && <CopyButton text={simplifiedText} />}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={simplifiedText}
            readOnly
            className="min-h-[300px] bg-muted font-sans"
          />
        </CardContent>
      </Card>

      {/* Traditional Output Card - Right */}
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>繁體中文 (Traditional)</CardTitle>
            {traditionalText && <CopyButton text={traditionalText} />}
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={traditionalText}
            readOnly
            className="min-h-[300px] bg-muted font-sans"
          />
        </CardContent>
      </Card>
    </>
  )
}

// Made with Bob
