import { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'

function fmtTs(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}

function toUnixTs(dateStr, timeStr) {
  return Math.floor(new Date(`${dateStr}T${timeStr}`).getTime() / 1000)
}

export default function AdminPanel() {
  const { electionState, startNewElection, stopElection, addPost, loading } = useWeb3()

  const [subTab, setSubTab] = useState('election') // 'election' | 'posts'

  // New election form
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endDate,   setEndDate]   = useState('')
  const [endTime,   setEndTime]   = useState('20:00')

  // Add post form
  const [postName, setPostName]         = useState('')
  const [candidateCount, setCandidateCount] = useState(2)
  const [candidates, setCandidates]     = useState(['', ''])

  const es = electionState
  const canStart  = !es?.hasElection || es?.isEnded
  const canStop   = es?.isActive
  const canAddPost= es?.hasElection && es?.isPending && !es?.isActive && !es?.isEnded

  const handleCandidateCountChange = (n) => {
    const count = Math.max(1, Math.min(20, Number(n)))
    setCandidateCount(count)
    setCandidates(prev => {
      const arr = [...prev]
      while (arr.length < count) arr.push('')
      return arr.slice(0, count)
    })
  }

  const handleStartElection = async (e) => {
    e.preventDefault()
    const s  = toUnixTs(startDate, startTime)
    const en = toUnixTs(endDate, endTime)
    if (isNaN(s) || isNaN(en) || s >= en) return alert('Invalid date/time range.')
    await startNewElection(s, en)
  }

  const handleStopElection = async () => {
    if (!window.confirm('Stop the election early? This cannot be undone.')) return
    await stopElection()
  }

  const handleAddPost = async (e) => {
    e.preventDefault()
    if (!postName.trim()) return
    await addPost(postName.trim(), candidateCount)
    setPostName('')
    setCandidates(['', ''])
    setCandidateCount(2)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-icon">⚙</span>
        <h2>Administration</h2>
        {es?.isActive && (
          <span className="live-badge">● LIVE — Election #{es.electionId}</span>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="sub-tabs">
        <button className={`sub-tab ${subTab === 'election' ? 'active' : ''}`} onClick={() => setSubTab('election')}>
          Election Setup
        </button>
        <button className={`sub-tab ${subTab === 'posts' ? 'active' : ''}`} onClick={() => setSubTab('posts')}>
          Ballot Posts {es?.postCount > 0 && <span className="sub-badge">{es.postCount}</span>}
        </button>
      </div>

      {/* ── ELECTION TAB ── */}
      {subTab === 'election' && (
        <>
          {/* Current status */}
          {es?.hasElection && (
            <div className="status-card">
              <div className="status-row">
                <span className="status-label">Election ID</span>
                <span className="status-value accent">#{es.electionId}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Status</span>
                <span className={`status-badge ${es.isActive ? 'live' : es.isEnded ? 'ended' : 'pending'}`}>
                  {es.isActive ? 'LIVE' : es.isEnded ? 'ENDED' : 'PENDING'}
                </span>
              </div>
              <div className="status-row">
                <span className="status-label">Opens</span>
                <span className="status-value">{fmtTs(es.votingStart)}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Closes</span>
                <span className="status-value">{fmtTs(es.votingEnd)}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Total Posts</span>
                <span className="status-value">{es.postCount}</span>
              </div>
            </div>
          )}

          {/* Stop election */}
          {canStop && (
            <div className="form-card danger-zone">
              <h3 className="form-title">Danger Zone</h3>
              <p className="form-hint" style={{ marginBottom: '1rem' }}>
                Stop the current election immediately. Voting will be closed and results will become available.
              </p>
              <button className="btn-danger" onClick={handleStopElection} disabled={loading}>
                ⬛ Stop Election Now
              </button>
            </div>
          )}

          {/* Start new election */}
          {canStart && (
            <form className="form-card" onSubmit={handleStartElection}>
              <h3 className="form-title">
                {es?.isEnded ? `Start Election #${es.electionId + 1}` : 'Initialize First Election'}
              </h3>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
              </div>
              <div className="form-row two-col">
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Processing…' : '▶ Start Election'}
              </button>
            </form>
          )}

          {!es?.hasElection && (
            <div className="status-card center">
              <p className="muted">No election has been initialized yet.</p>
            </div>
          )}

          {es?.isPending && !es?.isActive && (
            <div className="form-card">
              <div className="alert alert-warn">
                ◌ Election #{es.electionId} is scheduled but hasn't opened yet.
                Add your ballot posts before it starts!
              </div>
            </div>
          )}
        </>
      )}

      {/* ── POSTS TAB ── */}
      {subTab === 'posts' && (
        <>
          {!es?.hasElection && (
            <div className="status-card center">
              <p className="muted">Create an election first before adding posts.</p>
            </div>
          )}

          {es?.hasElection && (
            <>
              {/* Add post form — always shown when in pending state */}
              {canAddPost ? (
                <form className="form-card" onSubmit={handleAddPost}>
                  <h3 className="form-title">Add New Post / Position</h3>
                  <div className="form-group">
                    <label>Position Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Student President, Treasurer…"
                      value={postName}
                      onChange={e => setPostName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Candidates</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={candidateCount}
                      onChange={e => handleCandidateCountChange(e.target.value)}
                      required
                    />
                    <span className="form-hint">
                      Candidates appear as Candidate 1, 2… on the ballot.
                      You can name them in the voter-facing ballot later.
                    </span>
                  </div>

                  {/* Candidate name preview */}
                  <div className="candidate-preview">
                    {Array.from({ length: candidateCount }, (_, i) => (
                      <div className="candidate-preview-row" key={i}>
                        <span className="candidate-num">#{i}</span>
                        <span className="candidate-preview-label">Candidate {i + 1}</span>
                      </div>
                    ))}
                  </div>

                  <button className="btn-secondary" type="submit" disabled={loading}>
                    {loading ? 'Adding…' : '+ Add Post'}
                  </button>
                </form>
              ) : (
                <div className="form-card">
                  {es?.isActive && (
                    <div className="alert alert-warn">
                      ⚠ Posts cannot be added while voting is live.
                      Stop the election first or wait until it ends.
                    </div>
                  )}
                  {es?.isEnded && (
                    <div className="alert alert-warn">
                      ⚠ This election has ended. Start a new election to add posts.
                    </div>
                  )}
                </div>
              )}

              {/* Posts list */}
              {es?.posts?.length > 0 ? (
                <div className="form-card">
                  <h3 className="form-title">Configured Posts</h3>
                  <div className="posts-list">
                    {es.posts.map(p => (
                      <div className="post-item" key={p.id}>
                        <span className="post-index">Post {p.id}</span>
                        <span className="post-name">{p.name}</span>
                        <span className="post-candidates">{p.candidateCount} candidates</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                canAddPost && (
                  <div className="status-card center">
                    <p className="muted">No posts added yet. Use the form above.</p>
                  </div>
                )
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
