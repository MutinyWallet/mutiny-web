// Thanks you https://soorria.com/snippets/use-copy-solidjs
import type { Accessor } from 'solid-js'
import { createSignal } from 'solid-js'
export type UseCopyProps = {
    copiedTimeout?: number
}
type CopyFn = (text: string) => Promise<void>
export const useCopy = ({ copiedTimeout = 2000 }: UseCopyProps = {}): [
    copy: CopyFn,
    copied: Accessor<boolean>
] => {
    const [copied, setCopied] = createSignal(false)
    let timeout: NodeJS.Timeout
    const copy: CopyFn = async text => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => setCopied(false), copiedTimeout)
    }
    return [copy, copied]
}