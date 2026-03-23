import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { getVersion } from '@tauri-apps/api/app'
import { openUrl } from '@tauri-apps/plugin-opener'

export default function AboutWindow() {
  const [version, setVersion] = useState('')

  useEffect(() => {
    getVersion().then(setVersion)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen rounded-[14px] overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 select-none px-6">
      <img
        src="/inkognito.png"
        alt="Inkognito"
        className="w-16 h-16 mb-4"
        draggable={false}
      />

      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Inkognito
      </h1>

      <p className="text-[11px] text-neutral-400 mt-0.5">
        Version {version}
      </p>

      <p className="text-[12px] text-neutral-500 dark:text-neutral-400 text-center mt-4 leading-relaxed">
        A private, local-first markdown notepad.<br />
        Your thoughts deserve privacy.
      </p>

      <div className="flex flex-col items-center gap-1 mt-5">
        <p className="text-[12px] text-neutral-600 dark:text-neutral-300">
          Created by <span className="font-medium">Mohamed EL MOUSAAIF</span>
        </p>
        <button
          onClick={() => openUrl('https://github.com/arch-33')}
          className="text-[11px] text-blue-500 hover:text-blue-400 cursor-pointer"
        >
          @arch-33
        </button>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => openUrl('https://github.com/arch-33/inkognito')}
          className="text-[11px] px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
        >
          GitHub
        </button>
        <button
          onClick={() => getCurrentWindow().close()}
          className="text-[11px] px-3 py-1.5 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  )
}
