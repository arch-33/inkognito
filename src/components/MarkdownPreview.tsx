import { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import MermaidBlock from '@/components/MermaidBlock'

type Props = {
  content: string
}

export default function MarkdownPreview({ content }: Props) {
  const codeBlock = useCallback(
    (props: { className?: string; children?: React.ReactNode }) => {
      const { className, children } = props
      const match = className?.match(/language-(\w+)/)
      const lang = match?.[1]
      const code = String(children).replace(/\n$/, '')

      if (lang === 'mermaid') {
        return <MermaidBlock code={code} />
      }

      return (
        <code className={className}>
          {children}
        </code>
      )
    },
    [],
  )

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 prose prose-sm dark:prose-invert max-w-none text-[13px] editor-bg-dots bg-stone-50 dark:bg-[#1c1c1e]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{ code: codeBlock }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
