declare module 'react' {
  export function StrictMode(props: { children?: unknown }): unknown
  export function useCallback<T extends (...args: any[]) => unknown>(callback: T, dependencies?: unknown[]): T
  export function useEffect(effect: () => void | (() => void), dependencies?: unknown[]): void
  export function useRef<T>(initialValue: T): { current: T }
  export function useState<T>(initialValue: T): [T, (value: T | ((current: T) => T)) => void]
}

declare module 'react-dom/client' {
  export type Root = {
    render: (node: unknown) => void
  }

  export function createRoot(element: HTMLElement): Root
}

declare module 'react/jsx-runtime' {
  export const jsx: unknown
  export const jsxs: unknown
  export const Fragment: unknown
}

declare module '*.css' {
  const classes: Record<string, string>
  export default classes
}

declare namespace JSX {
  type Element = unknown

  interface IntrinsicElements {
    [elementName: string]: any
  }
}
