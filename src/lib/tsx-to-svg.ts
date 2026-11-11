import type { ParseError } from '@babel/parser'
import type {
  ArrowFunctionExpression,
  Node as AstNode,
  File,
  FunctionDeclaration,
  FunctionExpression,
  JSXAttribute,
  JSXElement,
  JSXFragment,
  ObjectExpression,
  Statement,
} from '@babel/types'

import { parse } from '@babel/parser'

export type ConvertResult =
  | { ok: true; svg: string }
  | { ok: false; error: { message: string; line?: number } }

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/**
 * SVG attributes whose spec name is camelCase. They must not be kebab-cased,
 * so they stay as written.
 */
const SVG_CAMEL_ATTRIBUTES = new Set([
  'attributeName',
  'attributeType',
  'baseFrequency',
  'baseProfile',
  'calcMode',
  'clipPathUnits',
  'contentScriptType',
  'contentStyleType',
  'diffuseConstant',
  'edgeMode',
  'externalResourcesRequired',
  'filterUnits',
  'gradientTransform',
  'gradientUnits',
  'kernelMatrix',
  'kernelUnitLength',
  'keyPoints',
  'keySplines',
  'keyTimes',
  'lengthAdjust',
  'limitingConeAngle',
  'markerHeight',
  'markerUnits',
  'markerWidth',
  'maskContentUnits',
  'maskUnits',
  'numOctaves',
  'pathLength',
  'patternContentUnits',
  'patternTransform',
  'patternUnits',
  'pointsAtX',
  'pointsAtY',
  'pointsAtZ',
  'preserveAlpha',
  'preserveAspectRatio',
  'primitiveUnits',
  'refX',
  'refY',
  'repeatCount',
  'repeatDur',
  'requiredExtensions',
  'requiredFeatures',
  'specularConstant',
  'specularExponent',
  'stdDeviation',
  'stitchTiles',
  'surfaceScale',
  'systemLanguage',
  'tableValues',
  'targetX',
  'targetY',
  'textLength',
  'viewBox',
  'viewTarget',
  'xChannelSelector',
  'yChannelSelector',
  'zoomAndPan',
])

/** Attributes React spells with a namespace prefix, e.g. `xlinkHref` → `xlink:href`. */
const NAMESPACED_ATTRIBUTE = /^(xlink|xml)([A-Z]\w*)$/

/** Error the converter raises for input it can't turn into SVG. Carries the line of the offending node. */
class ConvertError extends Error {
  readonly line: number | undefined

  constructor(message: string, node?: AstNode) {
    super(message)
    this.line = node?.loc?.start.line
  }
}

type SvgAttribute = { name: string; value: string }
type SvgText = { text: string }
type SvgNode = { tag: string; attributes: SvgAttribute[]; children: SvgChild[] }
type SvgChild = SvgNode | SvgText
type JsxRoot = JSXElement | JSXFragment
type FunctionNode =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression

/**
 * Converts a pasted TSX snippet into a pure SVG string.
 * The input is parsed, never executed. Errors are returned, not thrown.
 */
export function convertTsxToSvg(source: string): ConvertResult {
  try {
    const ast = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })
    const svg = toSvgNode(findSvgRoot(ast))
    const withNamespace = hasXmlns(svg)
      ? svg
      : {
          ...svg,
          attributes: [
            { name: 'xmlns', value: SVG_NAMESPACE },
            ...svg.attributes,
          ],
        }
    return { ok: true, svg: printNode(withNamespace, '') }
  } catch (error) {
    if (error instanceof ConvertError) {
      return { ok: false, error: { message: error.message, line: error.line } }
    }
    if (isParseError(error)) {
      return {
        ok: false,
        error: {
          message: error.message.replace(/\s*\(\d+:\d+\)$/, ''),
          line: error.loc.line,
        },
      }
    }
    throw error
  }
}

/** Babel's syntax errors carry a `loc`. Anything else is a converter bug and is rethrown. */
function isParseError(error: unknown): error is ParseError {
  return error instanceof SyntaxError && 'loc' in error
}

/** True when the svg already declares its namespace, so no `xmlns` is added. */
function hasXmlns(node: SvgNode): boolean {
  return node.attributes.some((attribute) => attribute.name === 'xmlns')
}

/**
 * Finds the `<svg>` to convert. Rule: exactly one top-level function may return JSX,
 * and its returned JSX is searched for the svg. With no such function, the first bare
 * JSX expression statement is used.
 */
function findSvgRoot(ast: File): JSXElement {
  const roots = ast.program.body.flatMap(declaredFunctions).flatMap((fn) => {
    const jsx = returnedJsx(fn)
    return jsx ? [jsx] : []
  })
  if (roots.length > 1) {
    throw new ConvertError(
      `Found ${roots.length} functions that return JSX. Paste only one component.`,
    )
  }

  const componentRoot = roots.at(0)
  const bareRoot = ast.program.body
    .flatMap((statement) =>
      statement.type === 'ExpressionStatement' &&
      isJsxRoot(statement.expression)
        ? [statement.expression]
        : [],
    )
    .at(0)
  const svg = firstSvg(componentRoot ?? bareRoot)
  if (!svg) throw new ConvertError('No <svg> element found.')
  return svg
}

/** Top-level function declarations, arrow and function expressions, including `export` forms. */
function declaredFunctions(statement: Statement): FunctionNode[] {
  switch (statement.type) {
    case 'FunctionDeclaration':
      return [statement]
    case 'VariableDeclaration':
      return statement.declarations.flatMap((declarator) =>
        isFunctionNode(declarator.init) ? [declarator.init] : [],
      )
    case 'ExportNamedDeclaration':
      return statement.declaration
        ? declaredFunctions(statement.declaration)
        : []
    case 'ExportDefaultDeclaration':
      return isFunctionNode(statement.declaration)
        ? [statement.declaration]
        : []
    default:
      return []
  }
}

/** The JSX a function returns: an arrow's expression body, or the first `return` in a block body. */
function returnedJsx(fn: FunctionNode): JsxRoot | undefined {
  if (fn.body.type !== 'BlockStatement') {
    return isJsxRoot(fn.body) ? fn.body : undefined
  }
  for (const statement of fn.body.body) {
    if (statement.type === 'ReturnStatement' && isJsxRoot(statement.argument)) {
      return statement.argument
    }
  }
  return undefined
}

/** Depth-first search for the first `<svg>` element in a JSX tree. */
function firstSvg(node: JsxRoot | undefined): JSXElement | undefined {
  if (!node) return undefined
  if (node.type === 'JSXElement' && isSvgElement(node)) return node
  for (const child of node.children) {
    if (child.type === 'JSXElement' || child.type === 'JSXFragment') {
      const found = firstSvg(child)
      if (found) return found
    }
  }
  return undefined
}

/** True for a JSX element named `svg`. */
function isSvgElement(element: JSXElement): boolean {
  const { name } = element.openingElement
  return name.type === 'JSXIdentifier' && name.name === 'svg'
}

/** Type guard for the function forms the component search accepts. */
function isFunctionNode(
  node: AstNode | null | undefined,
): node is FunctionNode {
  return (
    node?.type === 'FunctionDeclaration' ||
    node?.type === 'FunctionExpression' ||
    node?.type === 'ArrowFunctionExpression'
  )
}

/** Type guard for JSX elements and fragments. */
function isJsxRoot(node: AstNode | null | undefined): node is JsxRoot {
  return node?.type === 'JSXElement' || node?.type === 'JSXFragment'
}

/** Converts a JSX element into an SvgNode, rejecting React components. */
function toSvgNode(element: JSXElement): SvgNode {
  const { name } = element.openingElement
  if (name.type !== 'JSXIdentifier') {
    throw new ConvertError('Unsupported element name.', element)
  }
  if (/^[A-Z]/.test(name.name)) {
    throw new ConvertError(
      `<${name.name}> is a React component, not an SVG element.`,
      element,
    )
  }
  return {
    tag: name.name,
    attributes: attributesOf(element),
    children: childrenOf(element),
  }
}

/** Keeps literal attributes. Drops spreads and valueless booleans such as `aria-hidden`. */
function attributesOf(element: JSXElement): SvgAttribute[] {
  return element.openingElement.attributes.flatMap((attribute) => {
    if (attribute.type !== 'JSXAttribute' || !attribute.value) return []
    const name = svgAttributeName(attribute)
    return [{ name, value: attributeValue(attribute, name) }]
  })
}

/** Maps a React attribute name to its SVG name. */
function svgAttributeName(attribute: JSXAttribute): string {
  if (attribute.name.type === 'JSXNamespacedName') {
    return `${attribute.name.namespace.name}:${attribute.name.name.name}`
  }
  const name = attribute.name.name
  if (name === 'className') return 'class'
  if (name === 'xmlnsXlink') return 'xmlns:xlink'
  const namespaced = NAMESPACED_ATTRIBUTE.exec(name)
  if (namespaced) {
    const [, prefix = '', local = ''] = namespaced
    return `${prefix}:${kebabCase(local)}`
  }
  if (SVG_CAMEL_ATTRIBUTES.has(name)) return name
  return kebabCase(name)
}

/** Literal string/number values only. Anything else is an error naming the attribute. */
function attributeValue(attribute: JSXAttribute, name: string): string {
  const { value } = attribute
  if (value?.type === 'StringLiteral') return value.value
  if (value?.type === 'JSXExpressionContainer') {
    if (name === 'style' && value.expression.type === 'ObjectExpression') {
      return styleValue(value.expression)
    }
    const literal = literalValue(value.expression)
    if (literal !== undefined) return literal
  }
  throw new ConvertError(
    `Attribute ${name} has a non-literal value.`,
    attribute,
  )
}

/** Turns `{ strokeWidth: 2 }` into `stroke-width: 2`. Every value must be a literal. */
function styleValue(style: ObjectExpression): string {
  return style.properties
    .map((property) => {
      if (property.type !== 'ObjectProperty' || property.computed) {
        throw new ConvertError(
          'Style supports plain key: value pairs only.',
          property,
        )
      }
      const key = styleKey(property.key)
      const value = literalValue(property.value)
      if (value === undefined) {
        throw new ConvertError(
          `style.${key} has a non-literal value.`,
          property,
        )
      }
      return `${cssProperty(key)}: ${value}`
    })
    .join('; ')
}

/** Reads a style object key written as an identifier or a string. */
function styleKey(key: AstNode): string {
  if (key.type === 'Identifier') return key.name
  if (key.type === 'StringLiteral') return key.value
  throw new ConvertError('Unsupported style key.', key)
}

/** `strokeWidth` → `stroke-width`. `msTransform` → `-ms-transform`, as React does. */
function cssProperty(key: string): string {
  const kebab = kebabCase(key)
  return kebab.startsWith('ms-') ? `-${kebab}` : kebab
}

/** Literal string or number values, including negative numbers. */
function literalValue(node: AstNode): string | undefined {
  switch (node.type) {
    case 'StringLiteral':
      return node.value
    case 'NumericLiteral':
      return String(node.value)
    case 'UnaryExpression':
      return node.operator === '-' && node.argument.type === 'NumericLiteral'
        ? `-${node.argument.value}`
        : undefined
    default:
      return undefined
  }
}

/** `strokeWidth` → `stroke-width`. Leading capitals get no dash. */
function kebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter, index: number) =>
    index === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`,
  )
}

/** Element children, text, and literal expression children. JSX comment expressions are dropped. */
function childrenOf(element: JSXElement): SvgChild[] {
  return element.children.flatMap((child): SvgChild[] => {
    switch (child.type) {
      case 'JSXText': {
        const text = cleanJsxText(child.value)
        return text === undefined ? [] : [{ text }]
      }
      case 'JSXElement':
        return [toSvgNode(child)]
      case 'JSXExpressionContainer': {
        if (child.expression.type === 'JSXEmptyExpression') return []
        const literal = literalValue(child.expression)
        if (literal === undefined) {
          throw new ConvertError('A child expression is non-literal.', child)
        }
        return [{ text: literal }]
      }
      default:
        throw new ConvertError('Unsupported JSX child.', child)
    }
  })
}

/**
 * React's JSX whitespace rules: trim each line, drop blank lines,
 * and join the remaining lines with single spaces.
 */
function cleanJsxText(raw: string): string | undefined {
  const lines = raw.split(/\r\n|\n|\r/)
  let lastNonEmptyLine = 0
  lines.forEach((line, index) => {
    if (/[^ \t]/.test(line)) lastNonEmptyLine = index
  })

  let text = ''
  lines.forEach((line, index) => {
    let trimmed = line.replace(/\t/g, ' ')
    if (index !== 0) trimmed = trimmed.replace(/^ +/, '')
    if (index !== lines.length - 1) trimmed = trimmed.replace(/ +$/, '')
    if (trimmed) {
      text += index === lastNonEmptyLine ? trimmed : `${trimmed} `
    }
  })
  return text || undefined
}

/**
 * Prints a node with one attribute per line and two-space indent.
 * `indent` is the indent of the node's opening line; the first line is not prefixed.
 */
function printNode(node: SvgNode, indent: string): string {
  const { tag, attributes, children } = node
  const attributeLines = attributes.map(
    (attribute) =>
      `${indent}  ${attribute.name}="${escapeText(attribute.value).replace(/"/g, '&quot;')}"`,
  )
  const hasAttributes = attributeLines.length > 0
  const open = hasAttributes
    ? `<${tag}\n${attributeLines.join('\n')}\n${indent}>`
    : `<${tag}>`

  const firstChild = children.at(0)
  if (children.length === 0) {
    return hasAttributes
      ? `<${tag}\n${attributeLines.join('\n')}\n${indent}/>`
      : `<${tag} />`
  }
  if (children.length === 1 && firstChild && 'text' in firstChild) {
    return `${open}${escapeText(firstChild.text)}</${tag}>`
  }

  const body = children.map((child) =>
    'text' in child
      ? `${indent}  ${escapeText(child.text)}`
      : `${indent}  ${printNode(child, indent + '  ')}`,
  )
  return `${open}\n${body.join('\n')}\n${indent}</${tag}>`
}

/** Escapes text for SVG markup. Attribute values also escape double quotes at the call site. */
function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
