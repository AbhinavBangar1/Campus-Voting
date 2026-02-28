import { useState, useRef } from 'react'
import { useWeb3 } from '../context/Web3Context'

export default function VoterRegistry() {
  const { eligibleVoters, addVoter, removeVoter, importVoters, electionState, isAdmin } = useWeb3()

  const [newId,   setNewId]   = useState('')
  const [newName, setNewName] = useState('')
  const [search,  setSearch]  = useState('')
  const fileRef = useRef()

  const es = electionState

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newId.trim()) return
    addVoter({ id: newId.trim(), name: newName.trim() || newId.trim() })
    setNewId('')
    setNewName('')
  }

  const handleCSV = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean)
      const voters = lines.map(line => {
        const [id, name] = line.split(',').map(s => s.trim())
        return { id, name: name || id }
      }).filter(v => v.id)
      importVoters(voters)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = eligibleVoters.filter(v =>
    v.id.toLowerCase().includes(search.toLowerCase()) ||
    v.name.toLowerCase().includes(search.toLowerCase())
  )

  const total   = eligibleVoters.length
  const voted   = eligibleVoters.filter(v => v.votedOnChain).length
  const queued  = eligibleVoters.filter(v => v.queued && !v.votedOnChain).length
  const pending = total - voted - queued

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Voter Registry</h2>
        <span className="stat-chip">{total} registered</span>
      </div>
      {total > 0 && (
        <div className="voter-stats">
          <div className="voter-stat">
            <span className="voter-stat-val success">{voted}</span>
            <span className="voter-stat-label">Voted</span>
          </div>
          <div className="voter-stat">
            <span className="voter-stat-val accent2">{queued}</span>
            <span className="voter-stat-label">In Queue</span>
          </div>
          <div className="voter-stat">
            <span className="voter-stat-val muted">{pending}</span>
            <span className="voter-stat-label">Not Yet Voted</span>
          </div>
          {total > 0 && (
            <div className="voter-progress-bar">
              <div className="voter-progress-fill" style={{ width: `${Math.round((voted / total) * 100)}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Add voter form */}
      {isAdmin && (
        <div className="form-card">
          <h3 className="form-title">Register Voter</h3>
          <form className="inline-form" onSubmit={handleAdd}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Voter / Student ID</label>
              <input
                type="text"
                placeholder="e.g. STU-2024-001"
                value={newId}
                onChange={e => setNewId(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Full Name (optional)</label>
              <input
                type="text"
                placeholder="e.g. Alice Johnson"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
            <button className="btn-secondary" type="submit" style={{ alignSelf: 'flex-end' }}>
              + Register
            </button>
          </form>

          <div className="import-row">
            <span className="form-hint">Or bulk import from CSV (id, name per line):</span>
            <button className="btn-ghost sm" onClick={() => fileRef.current?.click()}>
              Import CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {/* Search */}
      {total > 0 && (
        <div className="form-card" style={{ paddingBottom: 0 }}>
          <div className="form-group">
            <label>Search Voters</label>
            <input
              type="text"
              placeholder="Search by ID or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {total === 0 ? (
        <div className="status-card center">
          <p className="muted">No voters registered yet.</p>
        </div>
      ) : (
        <div className="voter-list">
          {filtered.length === 0 && (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p className="muted">No matches found.</p>
            </div>
          )}
          {filtered.map(v => (
            <div className="voter-row" key={v.id}>
              <div className="voter-info">
                <span className={`voter-status-dot ${v.votedOnChain ? 'voted' : v.queued ? 'queued' : 'idle'}`} />
                <div className="voter-details">
                  <span className="voter-name">{v.name}</span>
                  <span className="voter-id">{v.id}</span>
                </div>
              </div>
              <div className="voter-actions">
                <span className={`voter-badge ${v.votedOnChain ? 'voted' : v.queued ? 'queued' : 'idle'}`}>
                  {v.votedOnChain ? '✓ Voted' : v.queued ? '⏳ Queued' : 'Eligible'}
                </span>
                {isAdmin && !v.votedOnChain && !v.queued && (
                  <button className="voter-remove" onClick={() => removeVoter(v.id)} title="Remove voter">
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
