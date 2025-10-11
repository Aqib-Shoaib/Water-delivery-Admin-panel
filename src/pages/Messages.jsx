import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

function useApiList(url) {
  const { token } = useAuth()
  const [items, setItems] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const load = React.useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) { setError(e.message || 'Failed to load') }
    finally { setLoading(false) }
  }, [url, token])
  return { items, loading, error, reload: load }
}

function MessageList({ items, loading, error, onRestore, onTrash, onSendNow }) {
  if (loading) return <div className="p-3 text-sm text-gray-500">Loading...</div>
  if (error) return <div className="p-3 text-sm text-red-600">{error}</div>
  if (!items?.length) return <div className="p-3 text-sm text-gray-500">No messages</div>
  return (
    <div className="divide-y border rounded-md">
      {items.map(m => (
        <div key={m._id} className="p-3 grid grid-cols-12 gap-3 items-center">
          <div className="col-span-6">
            <div className="flex items-center gap-2">
              {m.isPremiumSender && <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-yellow-100 text-yellow-800 border border-yellow-300">★ Premium</span>}
              <div className="font-medium text-primary truncate">{m.subject || '(No subject)'}</div>
            </div>
            {m.body && <div className="text-xs text-gray-600 line-clamp-1" dangerouslySetInnerHTML={{ __html: m.body }} />}
          </div>
          <div className="col-span-3 text-xs text-gray-600 truncate">From: {m.sender?.name || m.sender?.email || 'Unknown'}</div>
          <div className="col-span-2 text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
          <div className="col-span-1 flex justify-end gap-2">
            {onSendNow && m.status === 'scheduled' && (
              <button className="px-2 py-1 text-xs rounded-md border hover:bg-gray-50" onClick={() => onSendNow(m)}>Send now</button>
            )}
            {onRestore && (
              <button className="px-2 py-1 text-xs rounded-md border hover:bg-gray-50" onClick={() => onRestore(m)}>Restore</button>
            )}
            {onTrash && (
              <button className="px-2 py-1 text-xs rounded-md border hover:bg-red-50 text-red-600" onClick={() => onTrash(m)}>Trash</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Messages() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { token } = useAuth()
  const tab = (params.get('tab') || 'inbox').toLowerCase()

  function setTab(next) {
    const p = new URLSearchParams(params)
    p.set('tab', next)
    setParams(p)
  }

  React.useEffect(() => {
    const allowed = ['inbox','sent','drafts','scheduled','premium','trash','write']
    if (!allowed.includes(tab)) navigate('/messages?tab=inbox', { replace: true })
  }, [tab, navigate])

  // API hooks
  const inboxApi = useApiList(`${API_BASE}/api/messages/inbox`)
  const sentApi = useApiList(`${API_BASE}/api/messages/sent`)
  const draftsApi = useApiList(`${API_BASE}/api/messages/drafts`)
  const scheduledApi = useApiList(`${API_BASE}/api/messages/scheduled/window?days=3`)
  const premiumApi = useApiList(`${API_BASE}/api/messages/premium`)
  const trashApi = useApiList(`${API_BASE}/api/messages/trash`)

  React.useEffect(() => {
    if (!token) return
    if (tab === 'inbox') inboxApi.reload()
    if (tab === 'sent') sentApi.reload()
    if (tab === 'drafts') draftsApi.reload()
    if (tab === 'scheduled') scheduledApi.reload()
    if (tab === 'premium') premiumApi.reload()
    if (tab === 'trash') trashApi.reload()
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, token])

  async function moveToTrash(m) {
    const res = await fetch(`${API_BASE}/api/messages/${m._id}/trash`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      if (tab === 'inbox') inboxApi.reload()
      if (tab === 'sent') sentApi.reload()
      if (tab === 'drafts') draftsApi.reload()
      if (tab === 'scheduled') scheduledApi.reload()
      if (tab === 'premium') premiumApi.reload()
    }
  }

  async function restoreFromTrash(m) {
    const res = await fetch(`${API_BASE}/api/messages/${m._id}/restore`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) trashApi.reload()
  }

  async function sendScheduledNow(m) {
    const res = await fetch(`${API_BASE}/api/messages/scheduled/${m._id}/send-now`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) scheduledApi.reload()
  }

  // Compose state
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  // Recipients picker state
  const [selectedRecipients, setSelectedRecipients] = React.useState([]) // [{_id, name, email}]
  const [userQuery, setUserQuery] = React.useState('')
  const [userResults, setUserResults] = React.useState([])
  const [userLoading, setUserLoading] = React.useState(false)
  const [userError, setUserError] = React.useState('')
  const [usersCache, setUsersCache] = React.useState([]) // full list fetched once
  const [usersLoaded, setUsersLoaded] = React.useState(false)
  const [scheduledAt, setScheduledAt] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const recipientArray = React.useMemo(() => (selectedRecipients?.map(u => u._id) || []), [selectedRecipients])

  // Load users once and filter client-side by name/email to power search
  React.useEffect(() => {
    let active = true
    if (!userQuery) { setUserResults([]); setUserError(''); return }
    setUserLoading(true); setUserError('')
    const t = setTimeout(async () => {
      try {
        let source = usersCache
        if (!usersLoaded) {
          const res = await fetch(`${API_BASE}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          source = Array.isArray(data) ? data : []
          if (active) { setUsersCache(source); setUsersLoaded(true) }
        }
        if (!active) return
        const q = userQuery.toLowerCase()
        const filtered = (source || []).filter(u => {
          const name = (u.name || `${u.firstName || ''} ${u.lastName || ''}` || u.fullName || '').trim().toLowerCase()
          return name.includes(q)
        }).slice(0, 20)
        setUserResults(filtered)
      } catch {
        if (!active) return
        setUserError('Unable to load users for search')
        setUserResults([])
      } finally { if (active) setUserLoading(false) }
    }, 250)
    return () => { active = false; clearTimeout(t) }
  }, [userQuery, token, usersCache, usersLoaded])

  function addRecipient(user) {
    if (!user || !user._id) return
    if (selectedRecipients.find(u => u._id === user._id)) return
    setSelectedRecipients(prev => [...prev, { _id: user._id, name: user.name || user.fullName || user.email || 'User', email: user.email }])
    setUserQuery(''); setUserResults([])
  }

  function removeRecipient(id) {
    setSelectedRecipients(prev => prev.filter(u => u._id !== id))
  }

  async function createDraft() {
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, body, recipients: recipientArray })
      })
      if (res.ok) {
        setSubject(''); setBody(''); setSelectedRecipients([]); setUserQuery(''); setScheduledAt('');
        draftsApi.reload(); setTab('drafts')
      }
    } finally { setBusy(false) }
  }

  async function sendNow() {
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, body, recipients: recipientArray })
      })
      if (res.ok) {
        setSubject(''); setBody(''); setSelectedRecipients([]); setUserQuery(''); setScheduledAt('');
        sentApi.reload(); setTab('sent')
      }
    } finally { setBusy(false) }
  }

  async function scheduleSend() {
    if (!scheduledAt) return
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}/api/messages/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, body, recipients: recipientArray, scheduledAt })
      })
      if (res.ok) {
        setSubject(''); setBody(''); setSelectedRecipients([]); setUserQuery(''); setScheduledAt('');
        scheduledApi.reload(); setTab('scheduled')
      }
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="flex flex-wrap gap-2">
          {[
            ['inbox','Inbox'],
            ['sent','Sent'],
            ['drafts','Drafts'],
            ['scheduled','Scheduled'],
            ['premium','Premium'],
            ['trash','Trash'],
            ['write','Write'],
          ].map(([key,label]) => (
            <button key={key}
              className={`px-4 py-2 text-sm rounded-t-md border-b-2 ${tab === key ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-primary'}`}
              onClick={() => setTab(key)}
            >{label}</button>
          ))}
        </div>
      </div>

      {tab === 'inbox' && (
        <MessageList {...inboxApi} onTrash={moveToTrash} />
      )}

      {tab === 'sent' && (
        <MessageList {...sentApi} />
      )}

      {tab === 'drafts' && (
        <MessageList {...draftsApi} onTrash={moveToTrash} />
      )}

      {tab === 'scheduled' && (
        <MessageList {...scheduledApi} onSendNow={sendScheduledNow} onTrash={moveToTrash} />
      )}

      {tab === 'premium' && (
        <MessageList {...premiumApi} onTrash={moveToTrash} />
      )}

      {tab === 'trash' && (
        <MessageList {...trashApi} onRestore={restoreFromTrash} />
      )}

      {tab === 'write' && (
        <div className="max-w-3xl space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Subject</label>
            <input className="w-full px-3 py-2 border rounded-md" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Recipients</label>
            {/* Chips */}
            {selectedRecipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedRecipients.map(u => (
                  <span key={u._id} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-medium-blue text-primary">
                    <span className="max-w-[180px] truncate">{u.name || u.email || u._id}</span>
                    <button type="button" className="ml-1 text-gray-500 hover:text-red-600" onClick={() => removeRecipient(u._id)}>×</button>
                  </span>
                ))}
              </div>
            )}
            {/* Search input */}
            <input
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md focus:border-medium-blue"
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              placeholder="Search users by name"
            />
            {/* Results dropdown */}
            {userQuery && (
              <div className="mt-1 max-h-56 overflow-auto border rounded-md bg-white shadow-md">
                {userLoading && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>}
                {!userLoading && userError && <div className="px-3 py-2 text-sm text-red-600">{userError}</div>}
                {!userLoading && !userError && userResults.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                )}
                {!userLoading && !userError && userResults.map(u => (
                  <button key={u._id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                          onClick={() => addRecipient(u)}>
                    <span className="truncate text-primary">{u.name || u.fullName || u.email || u._id}</span>
                    <span className="ml-2 text-xs text-gray-500 truncate">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <RichTextEditor value={body} onChange={setBody} apiBase={API_BASE} />
          <div className="flex flex-wrap items-center gap-3">
            <button disabled={busy || recipientArray.length === 0} className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50 disabled:opacity-50" onClick={createDraft}>Save Draft</button>
            <button disabled={busy || recipientArray.length === 0} className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-50" onClick={sendNow}>Send Now</button>
            <div className="flex items-center gap-2">
              <input type="datetime-local" className="px-2 py-2 border rounded-md" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
              <button disabled={busy || !scheduledAt || recipientArray.length === 0} className="px-3 py-2 text-sm rounded-md bg-medium-blue text-white hover:opacity-90 disabled:opacity-50" onClick={scheduleSend}>Schedule</button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Tip: Scheduled list loads only upcoming (next 3 days). Frontend can trigger "Send now" once time arrives.
          </div>
        </div>
      )}
    </div>
  )
}

function RichTextEditor({ value, onChange, apiBase }) {
  const { token } = useAuth()
  const ref = React.useRef(null)
  const fileInputRef = React.useRef(null)
  const [uploading, setUploading] = React.useState(false)
  const [images, setImages] = React.useState([]) // session uploads

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
      fd.append('image', file)
      const res = await fetch(`${apiBase}/api/messages/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setImages((prev) => [data.url, ...prev])
      insertHTML(`<img src="${data.url}" alt="image" />`)
    } catch (err) {
      console.error(err)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">Body</label>
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
        placeholder="Write your message..."
      />
      {images.length > 0 && (
        <div className="mt-2 border rounded p-2">
          <div className="text-xs text-gray-600 mb-1">Uploaded images (click to insert):</div>
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <button key={url} type="button" className="border rounded p-1" onClick={() => insertHTML(`<img src='${url}' alt='image' />`)}>
                <img src={url} alt="uploaded" className="h-12 w-12 object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
