import React from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RichTextEditor({ value, onChange, apiBase, label }) {
  const { token } = useAuth()
  const ref = React.useRef(null)
  const fileInputRef = React.useRef(null)
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  function exec(command) {
    document.execCommand(command, false, null)
    handleInput()
  }

  function createLink() {
    const url = window.prompt('Enter URL')
    if (!url) return
    document.execCommand('createLink', false, url)
    handleInput()
  }

  function handleInput() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function insertHTML(html) {
    ref.current?.focus()
    document.execCommand('insertHTML', false, html)
    handleInput()
  }

  async function onPickImage(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${apiBase}/api/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      insertHTML(`<img src="${data.url}" alt="image" />`)
    } catch {
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      {label && <label className="block text-sm text-gray-600 mb-1">{label}</label>}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => exec('bold')}>Bold</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => exec('italic')}>Italic</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => exec('underline')}>Underline</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => exec('insertOrderedList')}>1. List</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={createLink}>Link</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => document.execCommand('removeFormat')}>Clear</button>
        <button type="button" className="px-2 py-1 text-xs border rounded" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload Image'}</button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onPickImage} />
      </div>
      <div
        ref={ref}
        className="w-full px-3 py-2 border rounded-md min-h-[200px] prose prose-sm max-w-none focus:outline-none"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  )
}
