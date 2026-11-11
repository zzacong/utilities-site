// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'

import { convertSvgToTsx } from './svg-to-tsx'

const XMLNS = 'http://www.w3.org/2000/svg'
const XLINK = 'http://www.w3.org/1999/xlink'

describe('convertSvgToTsx', () => {
  it('converts an icon svg to JSX with aria-hidden first and {...props} last', () => {
    const result =
      convertSvgToTsx(`<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="${XMLNS}">
  <path d="M7 7C8.65685 7 10 5.65685 10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  aria-hidden
  width="14"
  height="15"
  viewBox="0 0 14 15"
  fill="none"
  xmlns="${XMLNS}"
  {...props}
>
  <path
    d="M7 7C8.65685 7 10 5.65685 10 4"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>`,
    })
  })

  it('keeps nested elements, drops comments, and adds no xmlns when it is missing', () => {
    const result = convertSvgToTsx(`<svg>
  <!-- group -->
  <g fill-rule="evenodd">
    <rect x="0" />
  </g>
</svg>`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  aria-hidden
  {...props}
>
  <g
    fillRule="evenodd"
  >
    <rect
      x="0"
    />
  </g>
</svg>`,
    })
  })

  it.each([
    ['class="a"', 'className="a"'],
    ['xlink:href="#a"', 'xlinkHref="#a"'],
    ['xml:space="preserve"', 'xmlSpace="preserve"'],
    [`xmlns:xlink="${XLINK}"`, `xmlnsXlink="${XLINK}"`],
    ['viewBox="0 0 1 1"', 'viewBox="0 0 1 1"'],
    ['aria-label="Close"', 'aria-label="Close"'],
    ['data-test-id="x"', 'data-test-id="x"'],
  ])('maps %s to %s', (attribute, expected) => {
    const result = convertSvgToTsx(
      `<svg xmlns:xlink="${XLINK}"><path ${attribute} /></svg>`,
    )

    expect(result).toMatchObject({
      ok: true,
      svg: expect.stringContaining(`\n    ${expected}\n`),
    })
  })

  it('keeps an aria-hidden the svg already has instead of adding a second one', () => {
    const result = convertSvgToTsx('<svg aria-hidden="true"><path /></svg>')

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  aria-hidden="true"
  {...props}
>
  <path />
</svg>`,
    })
  })

  it('converts a style attribute into a React style object', () => {
    const result = convertSvgToTsx(
      '<svg><path style="fill: red; stroke-width: 2; -ms-transform: none; --brand: teal; background: url(data:image/png;base64,AA==)" /></svg>',
    )

    expect(result).toMatchObject({
      ok: true,
      svg: expect.stringContaining(
        '\n    style={{ fill: "red", strokeWidth: "2", msTransform: "none", "--brand": "teal", background: "url(data:image/png;base64,AA==)" }}\n',
      ),
    })
  })

  it('writes attribute values with quotes or ampersands as JS string expressions', () => {
    const result = convertSvgToTsx(
      '<svg><text data-label="say &quot;hi&quot; &amp;amp;" /></svg>',
    )

    expect(result).toMatchObject({
      ok: true,
      svg: expect.stringContaining('\n    data-label={"say \\"hi\\" &amp;"}\n'),
    })
  })

  it('prints a single text child inline and escapes JSX special characters', () => {
    const result = convertSvgToTsx(`<svg>
  <title>Close</title>
  <text>1 &lt; 2 {x}</text>
</svg>`)

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  aria-hidden
  {...props}
>
  <title>Close</title>
  <text>1 {"<"} 2 {"{"}x{"}"}</text>
</svg>`,
    })
  })

  it('accepts an XML declaration and doctype before the svg', () => {
    const result = convertSvgToTsx(
      '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE svg>\n<svg><path /></svg>',
    )

    expect(result).toEqual({
      ok: true,
      svg: `<svg
  aria-hidden
  {...props}
>
  <path />
</svg>`,
    })
  })

  it('reports markup that is not well-formed XML', () => {
    expect(convertSvgToTsx('<svg><path></svg>')).toEqual({
      ok: false,
      error: { message: 'Invalid SVG markup.' },
    })
  })

  it('reports input that has no svg element', () => {
    expect(convertSvgToTsx('<div><p /></div>')).toEqual({
      ok: false,
      error: { message: 'No <svg> element found.' },
    })
  })
})
