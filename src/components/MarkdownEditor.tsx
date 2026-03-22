import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useIsDark } from '@/hooks/useIsDark'
import { useUIStore } from '@/store/useUIStore'

const transparentBg = EditorView.theme({
  '&': { backgroundColor: 'transparent' },
  '.cm-scroller': { backgroundColor: 'transparent' },
  '.cm-content': { padding: '8px 16px' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none', paddingLeft: '8px' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
})

type Props = {
  value: string
  onChange: (value: string) => void
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const isDark = useIsDark()
  const { editor, appearance } = useUIStore((s) => s.settings)

  const extensions = useMemo(() => {
    const exts = [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      transparentBg,
    ]
    if (editor.spellCheck) {
      exts.push(EditorView.contentAttributes.of({ spellcheck: 'true' }))
    }
    if (editor.lineWrap) {
      exts.push(EditorView.lineWrapping)
    }
    return exts
  }, [editor.spellCheck, editor.lineWrap])

  return (
    <div className="flex-1 min-h-0 overflow-hidden editor-bg-dots bg-stone-50 dark:bg-[#1c1c1e]">
      <CodeMirror
        value={value}
        onChange={onChange}
        height="100%"
        extensions={extensions}
        theme={isDark ? oneDark : 'light'}
        basicSetup={{
          lineNumbers: editor.lineNumbers,
          foldGutter: false,
          highlightActiveLine: false,
          highlightSelectionMatches: true,
          bracketMatching: true,
        }}
        style={{
          fontFamily: `${appearance.editorFont}, monospace`,
          fontSize: appearance.fontSize,
          fontVariantLigatures: editor.fontLigatures ? 'normal' : 'none',
          height: '100%',
        }}
      />
    </div>
  )
}
