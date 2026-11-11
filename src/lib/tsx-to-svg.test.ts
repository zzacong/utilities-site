import { describe, expect, it } from 'vitest'

import { convertTsxToSvg } from './tsx-to-svg'

const XMLNS = 'http://www.w3.org/2000/svg'

describe('convertTsxToSvg', () => {
  it('prints a bare svg with literal attributes in the agreed format', () => {
    const result = convertTsxToSvg(`
<svg width="14" xmlns="${XMLNS}">
  <path d="M0 0" />
</svg>
`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  width="14"
  xmlns="${XMLNS}"
>
  <path
    d="M0 0"
  />
</svg>`,
    })
  })

  it('converts the svg returned by a component and drops spreads, boolean attributes and comments', () => {
    const result =
      convertTsxToSvg(`import type { IconProps } from 'lib/types/icons';

export default function Account(props: IconProps) {
  return (
    <svg
      aria-hidden
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="${XMLNS}"
      {...props}
    >
      {/* the head */}
      <path
        d="M7 7C8.65685 7 10 5.65685 10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  width="14"
  height="15"
  viewBox="0 0 14 15"
  fill="none"
  xmlns="${XMLNS}"
>
  <path
    d="M7 7C8.65685 7 10 5.65685 10 4"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`,
    })
  })

  it('maps React attribute names to SVG names, keeping SVG camelCase names intact', () => {
    const result = convertTsxToSvg(`
<svg xmlns="${XMLNS}" viewBox="0 0 14 15" preserveAspectRatio="none" className="icon">
  <use xlinkHref="#a" strokeWidth="2" />
</svg>
`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  xmlns="${XMLNS}"
  viewBox="0 0 14 15"
  preserveAspectRatio="none"
  class="icon"
>
  <use
    xlink:href="#a"
    stroke-width="2"
  />
</svg>`,
    })
  })

  it('converts a style object into a CSS string with kebab-cased keys', () => {
    const result = convertTsxToSvg(`
<svg xmlns="${XMLNS}">
  <path style={{ fill: 'red', strokeWidth: 2 }} />
</svg>
`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  xmlns="${XMLNS}"
>
  <path
    style="fill: red; stroke-width: 2"
  />
</svg>`,
    })
  })

  it('adds xmlns as the first attribute when the svg does not have it', () => {
    const result = convertTsxToSvg(`
<svg width="14">
  <path d="M0 0" />
</svg>
`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  xmlns="${XMLNS}"
  width="14"
>
  <path
    d="M0 0"
  />
</svg>`,
    })
  })

  it('collapses multi-line text children using JSX whitespace rules', () => {
    const result = convertTsxToSvg(`
<svg xmlns="${XMLNS}">
  <title>
    Account
    icon
  </title>
</svg>
`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  xmlns="${XMLNS}"
>
  <title>Account icon</title>
</svg>`,
    })
  })

  it('reports a non-literal attribute value with its line', () => {
    const result =
      convertTsxToSvg(`export default function Icon({ color }: IconProps) {
  return (
    <svg xmlns="${XMLNS}">
      <path fill={color} />
    </svg>
  )
}
`)

    expect(result).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining('fill'), line: 4 },
    })
  })

  it('reports a paste with several JSX-returning functions', () => {
    const result = convertTsxToSvg(`function Helper() {
  return <path d="M0 0" />
}

export default function Icon() {
  return <svg xmlns="${XMLNS}" />
}
`)

    expect(result).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining('one component') },
    })
  })

  it('reports input that contains no svg element', () => {
    const result = convertTsxToSvg(`export default function Icon() {
  return <div />
}
`)

    expect(result).toMatchObject({
      ok: false,
      error: { message: expect.stringContaining('<svg>') },
    })
  })

  it('reports a syntax error with its line', () => {
    const result = convertTsxToSvg(`
<svg xmlns="${XMLNS}">
  <path d="M0 0">
</svg>
`)

    expect(result).toMatchObject({
      ok: false,
      error: { line: expect.any(Number) },
    })
  })
})
