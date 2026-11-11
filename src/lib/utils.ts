/** Converts a string to kebab-case, collapsing spaces and underscores to dashes. */
export function toKebabCase(input: string) {
  return (
    input
      .trim()
      // .replace(/([a-z])([A-Z])/g, '$1-$2') // Get all lowercase to uppercase transitions
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with dashes
      .replace(/^-+|-+$/g, '') // Trim dashes from start and end
      .toLowerCase()
  )
}
