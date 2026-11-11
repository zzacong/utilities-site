import type { ConvertResult } from './tsx-to-svg'

/** A JSX element ready to print: tag, attribute lines already in JSX syntax, and children. */
type JsxNode = { tag: string; attributes: string[]; children: JsxChild[] }
type JsxChild = JsxNode | { text: string }

/** React spellings that a plain camelCase of the SVG name would get wrong. */
const REACT_ATTRIBUTE_NAMES = new Map([['class', 'className']])

/**
 * Converts pasted SVG markup into the `<svg>` JSX a React icon component returns.
 * Parses with the browser's XML parser. The input is never executed.
 * Adds `aria-hidden` and `{...props}` to the root only.
 */
export function convertSvgToTsx(source: string): ConvertResult {
  const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
  if (doc.getElementsByTagName('parsererror').length > 0) {
    return { ok: false, error: { message: 'Invalid SVG markup.' } }
  }
  const svg = doc.getElementsByTagName('svg').item(0)
  if (!svg) return { ok: false, error: { message: 'No <svg> element found.' } }

  const root = toJsxNode(svg)
  const attributes = svg.hasAttribute('aria-hidden')
    ? root.attributes
    : ['aria-hidden', ...root.attributes]
  return {
    ok: true,
    svg: printNode({ ...root, attributes: [...attributes, '{...props}'] }, ''),
  }
}

/** Converts a DOM element and its children, keeping source attribute order. */
function toJsxNode(element: Element): JsxNode {
  return {
    tag: element.tagName,
    attributes: Array.from(element.attributes, attributeLine),
    children: Array.from(element.childNodes).flatMap(toJsxChildren),
  }
}

/** Element and text children. Whitespace-only text with a newline is indentation and is dropped. Comments are dropped. */
function toJsxChildren(node: ChildNode): JsxChild[] {
  if (node instanceof Element) return [toJsxNode(node)]
  if (node instanceof Text) {
    return /^\s*$/.test(node.data) && node.data.includes('\n')
      ? []
      : [{ text: node.data }]
  }
  return []
}

/** One JSX attribute line, e.g. `strokeWidth="1.5"`, or `style={{ ... }}` for style. */
function attributeLine(attribute: Attr): string {
  const name = reactAttributeName(attribute.name)
  if (name === 'style') return `style={${styleObject(attribute.value)}}`
  return `${name}=${stringAttributeValue(attribute.value)}`
}

/**
 * SVG attribute name → React prop name. `aria-*` and `data-*` stay kebab-case, since React passes them through.
 * Namespaced names join with a dash first, so `xlink:href` → `xlinkHref`.
 */
function reactAttributeName(name: string): string {
  if (name.startsWith('aria-') || name.startsWith('data-')) return name
  return REACT_ATTRIBUTE_NAMES.get(name) ?? camelCase(name.replace(':', '-'))
}

/** `stroke-width` → `strokeWidth`. Names without dashes are returned unchanged. */
function camelCase(name: string): string {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
}

/**
 * A JSX string attribute cannot hold `"` or `&` (JSX decodes entities there),
 * so those values become a JS string expression.
 */
function stringAttributeValue(value: string): string {
  return /["&]/.test(value) ? `{${JSON.stringify(value)}}` : `"${value}"`
}

/** `fill: red; stroke-width: 2` → `{ fill: "red", strokeWidth: "2" }`. Declarations without a colon are dropped. */
function styleObject(css: string): string {
  const entries = splitDeclarations(css).map((declaration) => {
    const colon = declaration.indexOf(':')
    const property = declaration.slice(0, colon).trim()
    const value = declaration.slice(colon + 1).trim()
    return `${styleKey(property)}: ${JSON.stringify(value)}`
  })
  return entries.length > 0 ? `{ ${entries.join(', ')} }` : '{}'
}

/** Splits on `;` outside parentheses, so `url(data:…;base64,…)` stays whole. */
function splitDeclarations(css: string): string[] {
  const declarations: string[] = []
  let depth = 0
  let current = ''
  for (const char of css) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === ';' && depth === 0) {
      declarations.push(current)
      current = ''
    } else {
      current += char
    }
  }
  declarations.push(current)
  return declarations.filter((declaration) => declaration.includes(':'))
}

/** `stroke-width` → `strokeWidth`, `-ms-transform` → `msTransform`. Custom properties stay quoted. */
function styleKey(property: string): string {
  if (property.startsWith('--')) return JSON.stringify(property)
  const withoutMsPrefix = property.startsWith('-ms-')
    ? property.slice(1)
    : property
  return camelCase(withoutMsPrefix)
}

/** Prints a node with one attribute per line and two-space indent, matching the forward converter. */
function printNode(node: JsxNode, indent: string): string {
  const { tag, attributes, children } = node
  const attributeLines = attributes.map((line) => `${indent}  ${line}`)
  const open =
    attributes.length > 0
      ? `<${tag}\n${attributeLines.join('\n')}\n${indent}>`
      : `<${tag}>`

  if (children.length === 0) {
    return attributes.length > 0
      ? `<${tag}\n${attributeLines.join('\n')}\n${indent}/>`
      : `<${tag} />`
  }
  const firstChild = children.at(0)
  if (children.length === 1 && firstChild && 'text' in firstChild) {
    return `${open}${escapeJsxText(firstChild.text)}</${tag}>`
  }
  const body = children.map((child) =>
    'text' in child
      ? `${indent}  ${escapeJsxText(child.text)}`
      : `${indent}  ${printNode(child, indent + '  ')}`,
  )
  return `${open}\n${body.join('\n')}\n${indent}</${tag}>`
}

/** JSX text cannot hold `{`, `}`, `<`, `>` or `&` literally, so each becomes a JS string expression. */
function escapeJsxText(text: string): string {
  return text.replace(/[{}<>&]/g, (char) => `{${JSON.stringify(char)}}`)
}
