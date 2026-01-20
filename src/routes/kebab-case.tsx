import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import CopyButton from '@/components/copy-button'
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
import { toKebabCase } from '@/lib/utils'

export const Route = createFileRoute('/kebab-case')({
  head: () => {
    return {
      meta: [{ title: `Kebab case · Utilities` }],
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ExampleWrapper>
      <KebabCaseForm />
    </ExampleWrapper>
  )
}

function KebabCaseForm() {
  const [inputValue, setInputValue] = useState('')
  const kebabString = toKebabCase(inputValue)

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
            />
          </Field>

          {kebabString && (
            <Field orientation="horizontal" className="items-start">
              <div className="flex w-full items-center self-stretch rounded-xl bg-muted px-2.5 py-1">
                <p className="font-mono text-sm font-medium text-foreground">
                  {kebabString}
                </p>
              </div>
              <CopyButton text={kebabString} />
            </Field>
          )}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
