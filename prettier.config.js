//  @ts-check

/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier-plugin-tailwindcss').PluginOptions & import('@ianvs/prettier-plugin-sort-imports').PrettierConfig & import('prettier').Config}
 */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  plugins: [
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  tailwindStylesheet: './src/styles.css',
  tailwindFunctions: ['clsx', 'cva', 'cn', 'twMerge'],
  importOrderParserPlugins: ['typescript', 'jsx'],
  importOrder: [
    '<TYPES>^(node:)',
    '<TYPES>',
    '<TYPES>^@/',
    '',
    '<BUILTIN_MODULES>',
    '^(@tanstack)',
    '^(react/(.*)$)|^(react$)',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/',
    '',
    '^[../]',
    '^[./]',
  ],
}

export default config
