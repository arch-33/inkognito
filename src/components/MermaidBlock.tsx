import { useEffect, useRef, useState, useCallback } from 'react'
import mermaid from 'mermaid'
import { useIsDark } from '@/hooks/useIsDark'

let mermaidInitialized = false

export default function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const isDark = useIsDark()

  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const translateStart = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!svgRef.current) return
    const el = svgRef.current

    const theme = isDark ? 'neutral' : 'default'
    const themeVariables = isDark
      ? {
          background: 'transparent',
          mainBkg: '#2a2a2e',
          nodeBorder: '#555',
          lineColor: '#888',
          textColor: '#ddd',
          primaryColor: '#3b82f6',
          primaryTextColor: '#fff',
          primaryBorderColor: '#5b9cf6',
          secondaryColor: '#374151',
          tertiaryColor: '#1f2937',
        }
      : undefined

    // Only re-initialize when theme changes
    if (!mermaidInitialized || isDark) {
      mermaid.initialize({ startOnLoad: false, theme, themeVariables })
      mermaidInitialized = true
    }

    const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`
    let cancelled = false

    mermaid.render(id, code).then(({ svg }) => {
      if (cancelled || !el) return
      el.innerHTML = svg
      const svgEl = el.querySelector('svg')
      if (svgEl) {
        svgEl.style.backgroundColor = 'transparent'
        svgEl.removeAttribute('height')
        svgEl.style.maxWidth = '100%'
      }
    }).catch(() => {
      if (!cancelled && el) el.textContent = code
    })

    // Reset zoom/pan when code changes
    setScale(1)
    setTranslate({ x: 0, y: 0 })

    return () => {
      cancelled = true
      // Clean up rendered SVG content
      if (el) el.innerHTML = ''
      // Remove mermaid's detached render container if it exists
      const rendered = document.getElementById(id)
      if (rendered) rendered.remove()
    }
  }, [code, isDark])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only zoom on pinch (ctrlKey) — normal scroll passes through
    if (!e.ctrlKey) return
    e.preventDefault()
    e.stopPropagation()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale((s) => Math.min(3, Math.max(0.3, s + delta)))
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    translateStart.current = { ...translate }
  }, [translate])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    setTranslate({
      x: translateStart.current.x + (e.clientX - dragStart.current.x),
      y: translateStart.current.y + (e.clientY - dragStart.current.y),
    })
  }, [dragging])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handleReset = useCallback(() => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }, [])

  const isTransformed = scale !== 1 || translate.x !== 0 || translate.y !== 0

  return (
    <div className="my-3 relative group">
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-white/5 p-3 ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          ref={svgRef}
          className="flex justify-center transition-transform duration-75"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>
      {/* Controls */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          className="w-6 h-6 rounded bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
          className="w-6 h-6 rounded bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[11px] font-medium cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center"
        >
          -
        </button>
        {isTransformed && (
          <button
            onClick={handleReset}
            className="h-6 px-1.5 rounded bg-neutral-200/80 dark:bg-neutral-700/80 text-neutral-600 dark:text-neutral-300 text-[10px] cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
