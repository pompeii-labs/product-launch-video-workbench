// Dependency-free stand-in for shadcn's cn(): these components render with inline styles, not Tailwind.
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}
