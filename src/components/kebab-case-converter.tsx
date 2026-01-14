import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { ExampleWrapper } from '@/components/example'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toKebabCase } from '@/lib/utils'

export function KebabCaseConverter() {
  return (
    <ExampleWrapper>
      <KebabCaseForm />
    </ExampleWrapper>
  )
}

function KebabCaseForm() {
  const [inputValue, setInputValue] = useState('')
  const [copied, setCopied] = useState(false)
  const kebabString = toKebabCase(inputValue)

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    setInputValue(pastedText)
    const converted = toKebabCase(pastedText)
    await copyToClipboard(converted)
  }

  const onCopy = async () => {
    if (!kebabString) return
    await copyToClipboard(kebabString)
  }

  return (
    <Card className="col-span-2 mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Kebab case converter</CardTitle>
        <CardDescription>Convert any string into kebab-case</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field orientation="horizontal">
            <Input
              id="small-form-name"
              placeholder="paste your string here..."
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPaste={handlePaste}
            />
          </Field>

          {kebabString && (
            <Field orientation="horizontal" className="items-start">
              <div className="w-full rounded-xl bg-muted px-2.5 py-1">
                <p className="font-mono text-sm font-medium text-foreground">
                  {kebabString}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger variant="outline" size="icon" onClick={onCopy}>
                  <span className="sr-only">{copied ? 'Copied!' : 'Copy'}</span>
                  {copied ? <Check /> : <Copy />}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy</p>
                </TooltipContent>
              </Tooltip>
            </Field>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
