import React from 'react'

export default function ImageUpload({
  label,
  value, // existing URL for preview (string)
  file, // selected File for preview in deferred mode
  onPick, // (file) => void, for deferred mode
  upload, // async (file) => Promise<string>, for immediate upload
  onUploaded, // (url) => void, called after successful upload
  buttonText = 'Upload Image',
  size = 'md', // 'sm' | 'md'
  disabled = false,
  className = '',
  multiple = false,
}) {
  const inputRef = React.useRef(null)
  const [uploading, setUploading] = React.useState(false)

  const dim = size === 'sm' ? 'w-24 h-24' : 'w-32 h-32'

  async function handleChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    try {
      if (upload && onUploaded) {
        setUploading(true)
        for (const f of files) {
          // sequential to keep UI simple and avoid throttling
          const url = await upload(f)
          onUploaded(url)
        }
      } else if (onPick) {
        // backward compatibility: if multiple, call onPick for each
        for (const f of files) onPick(f)
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const previewUrl = file ? URL.createObjectURL(file) : (typeof value === 'string' ? value : '')

  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-primary mb-2">{label}</label>}
      <div className={`${dim} bg-light-blue rounded-lg flex items-center justify-center border-2 border-dashed border-medium-blue overflow-hidden`}>
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="w-full h-full object-contain p-2" />
        ) : (
          <svg className="w-12 h-12 text-medium-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={disabled || uploading} multiple={multiple} />
      <button type="button" className={`mt-2 px-4 py-2 bg-medium-blue text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`} disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? 'Uploading...' : buttonText}
      </button>
    </div>
  )
}

