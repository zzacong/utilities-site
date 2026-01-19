import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

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

export const Route = createFileRoute('/character-count')({
  head: () => {
    return {
      meta: [{ title: `Character count · Utilities` }],
    }
  },
  component: CharacterCountPage,
})

function CharacterCountPage() {
  return (
    <ExampleWrapper>
      <CharacterCaseForm />
    </ExampleWrapper>
  )
}

function CharacterCaseForm() {
  const [inputValue, setInputValue] = useState('')
  const characterLen = inputValue.length

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

          <Field orientation="horizontal">
            <p className="text-sm text-muted-foreground">Character count: </p>
            <p className="text-sm font-medium text-foreground">
              {characterLen}
            </p>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
