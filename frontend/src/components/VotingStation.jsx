import { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'

// ── Non-admin voter view ─────────────────────────────────────────────
function VoterBallot() {
  const { electionState, selectedAccount, enqueueBallot, checkVoterStatus, loading } = useWeb3()

  const [selections, setSelections]   = useState({})
  const [step, setStep]               = useState('ballot') // 'ballot' | 'confirm' | 'done' | 'already'
  const [checking, setChecking]       = useState(false)

  const es = electionState
  const allSelected = es?.posts?.every(p => selections[p.id] !== undefined)

  const handleConfirm = async () => {
    if (!allSelected) return alert('Please select a candidate for every post.')
    setChecking(true)
    const voted = await checkVoterStatus(selectedAccount)
    setChecking(false)
    if (voted) { setStep('already'); return }
    setStep('confirm')
  }

  const handleSubmit = async () => {
    const candidateIds = es.posts.map(p => selections[p.id])
    const short = `${selectedAccount.slice(0, 6)}…${selectedAccount.slice(-4)}`
    const success = await enqueueBallot(selectedAccount, short, candidateIds)
    if (success) setStep('done')
  }

  if (step === 'already') {
    return (
      <div className="form-card">
        <div className="alert alert-warn" style={{ marginBottom: 0 }}>
          ⚠ Your wallet <code>{selectedAccount.slice(0, 10)}…</code> has already voted in this election.
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h3>Ballot Submitted</h3>
        <p>Your ballot is in the queue. The admin will register it on-chain.</p>
      </div>
    )
  }

  return (
    <>
      {/* Info banner */}
      <div className="voter-self-banner">
        <span className="voter-self-label">Voting as</span>
        <span className="voter-self-addr">{selectedAccount}</span>
      </div>

      {step === 'ballot' && (
        <div className="form-card">
          <h3 className="form-title">Cast Your Vote — Election #{es?.electionId}</h3>

          {es?.posts?.length === 0 && (
            <div className="alert alert-warn">No ballot posts have been added yet.</div>
          )}

          {es?.posts?.map(post => (
            <div className="ballot-post" key={post.id}>
              <div className="ballot-post-title">
                <span className="ballot-post-num">Post {post.id}</span>
                {post.name}
                {selections[post.id] !== undefined && <span className="post-selected-tick">✓</span>}
              </div>
              <div className="ballot-candidates">
                {Array.from({ length: post.candidateCount }, (_, c) => (
                  <label
                    key={c}
                    className={`candidate-row ${selections[post.id] === c ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`post-${post.id}`}
                      checked={selections[post.id] === c}
                      onChange={() => setSelections(prev => ({ ...prev, [post.id]: c }))}
                    />
                    <span className="candidate-marker">{selections[post.id] === c ? '◉' : '○'}</span>
                    <span className="candidate-name">Candidate {c + 1}</span>
                    <span className="candidate-id">#{c}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="ballot-actions">
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={!allSelected || checking || loading}
            >
              {checking ? 'Checking eligibility…' : 'Review My Ballot →'}
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="form-card">
          <h3 className="form-title">Confirm Your Ballot</h3>
          <p className="form-hint" style={{ marginBottom: '1rem' }}>
            Once submitted you cannot change your vote.
          </p>

          <div className="review-list">
            {es?.posts?.map(post => (
              <div className="review-row" key={post.id}>
                <span className="review-post">{post.name}</span>
                <span className="review-choice">Candidate {selections[post.id] + 1}</span>
              </div>
            ))}
          </div>

          <div className="ballot-actions">
            <button className="btn-ghost" onClick={() => setStep('ballot')}>← Edit</button>
            <button className="btn-danger" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting…' : '⬡ Submit Ballot'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Admin voter-on-behalf view ───────────────────────────────────────
function AdminBallotStation() {
  const { electionState, eligibleVoters, enqueueBallot, loading } = useWeb3()

  const [step, setStep]                   = useState('select') // 'select' | 'ballot' | 'confirm' | 'done'
  const [selectedVoter, setSelectedVoter] = useState(null)
  const [selections, setSelections]       = useState({})
  const [search, setSearch]               = useState('')

  const es = electionState
  const eligibleNow = eligibleVoters.filter(v => !v.votedOnChain && !v.queued)
  const filtered = eligibleNow.filter(v =>
    v.id.toLowerCase().includes(search.toLowerCase()) ||
    v.name.toLowerCase().includes(search.toLowerCase())
  )
  const allSelected = es?.posts?.every(p => selections[p.id] !== undefined)

  const handleReset = () => {
    setStep('select')
    setSelectedVoter(null)
    setSelections({})
    setSearch('')
  }

  const handleSubmit = async () => {
    const candidateIds = es.posts.map(p => selections[p.id])
    const success = await enqueueBallot(selectedVoter.id, selectedVoter.name, candidateIds)
    if (success) setStep('done')
  }

  if (step === 'done') {
    return (
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h3>Ballot Queued</h3>
        <p>{selectedVoter?.name}'s ballot is in the queue. Go to the Queue tab to submit on-chain.</p>
        <button className="btn-primary" onClick={handleReset}>Next Voter →</button>
      </div>
    )
  }

  return (
    <>
      {/* Step indicator */}
      <div className="step-bar">
        {['Select Voter', 'Fill Ballot', 'Confirm'].map((label, i) => {
          const idx = ['select', 'ballot', 'confirm'].indexOf(step)
          return (
            <div key={i} className={`step-item ${i < idx ? 'done' : i === idx ? 'active' : ''}`}>
              <span className="step-num">{i < idx ? '✓' : i + 1}</span>
              <span className="step-label">{label}</span>
              {i < 2 && <span className="step-sep">›</span>}
            </div>
          )
        })}
      </div>

      {/* Step 1 — pick voter */}
      {step === 'select' && (
        <div className="form-card">
          <h3 className="form-title">Select Voter from Registry</h3>
          {eligibleNow.length === 0 ? (
            <div className="alert alert-warn">
              No eligible voters. Register voters in the 👥 Voters tab first.
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Name or ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="voter-pick-list">
                {filtered.length === 0 && <p className="muted" style={{ padding: '1rem' }}>No matches.</p>}
                {filtered.map(v => (
                  <button
                    key={v.id}
                    className="voter-pick-row"
                    onClick={() => { setSelectedVoter(v); setSelections({}); setStep('ballot') }}
                  >
                    <div className="voter-pick-info">
                      <span className="voter-pick-name">{v.name}</span>
                      <span className="voter-pick-id">{v.id}</span>
                    </div>
                    <span className="voter-pick-arrow">→</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2 — ballot */}
      {step === 'ballot' && (
        <div className="form-card">
          <div className="ballot-voter-chip" style={{ marginBottom: '1.25rem' }}>
            <span className="ballot-voter-name">{selectedVoter?.name}</span>
            <span className="ballot-voter-id">{selectedVoter?.id}</span>
          </div>

          {es?.posts?.map(post => (
            <div className="ballot-post" key={post.id}>
              <div className="ballot-post-title">
                <span className="ballot-post-num">Post {post.id}</span>
                {post.name}
                {selections[post.id] !== undefined && <span className="post-selected-tick">✓</span>}
              </div>
              <div className="ballot-candidates">
                {Array.from({ length: post.candidateCount }, (_, c) => (
                  <label
                    key={c}
                    className={`candidate-row ${selections[post.id] === c ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`post-${post.id}`}
                      checked={selections[post.id] === c}
                      onChange={() => setSelections(prev => ({ ...prev, [post.id]: c }))}
                    />
                    <span className="candidate-marker">{selections[post.id] === c ? '◉' : '○'}</span>
                    <span className="candidate-name">Candidate {c + 1}</span>
                    <span className="candidate-id">#{c}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="ballot-actions">
            <button className="btn-ghost" onClick={handleReset}>← Back</button>
            <button className="btn-primary" onClick={() => setStep('confirm')} disabled={!allSelected}>
              Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — confirm */}
      {step === 'confirm' && (
        <div className="form-card">
          <h3 className="form-title">Confirm & Queue</h3>
          <div className="ballot-voter-chip" style={{ marginBottom: '1.25rem' }}>
            <span className="ballot-voter-name">{selectedVoter?.name}</span>
            <span className="ballot-voter-id">{selectedVoter?.id}</span>
          </div>
          <div className="review-list">
            {es?.posts?.map(post => (
              <div className="review-row" key={post.id}>
                <span className="review-post">{post.name}</span>
                <span className="review-choice">Candidate {selections[post.id] + 1}</span>
              </div>
            ))}
          </div>
          <div className="ballot-actions">
            <button className="btn-ghost" onClick={() => setStep('ballot')}>← Edit</button>
            <button className="btn-danger" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Processing…' : '📋 Add to Queue'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Main VotingStation ───────────────────────────────────────────────
export default function VotingStation() {
  const { electionState, isAdmin } = useWeb3()
  const es = electionState

  if (!es?.isActive) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="panel-icon">🗳</span>
          <h2>Voting Station</h2>
        </div>
        <div className="status-card center">
          {!es?.hasElection && <p className="muted">No election configured yet.</p>}
          {es?.isPending && (
            <p className="muted">
              Election #{es.electionId} opens at{' '}
              <strong>{new Date(es.votingStart * 1000).toLocaleString()}</strong>
            </p>
          )}
          {es?.isEnded && <p className="muted">Election #{es.electionId} has ended. Check the Results tab.</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-icon">🗳</span>
        <h2>Voting Station</h2>
        <span className="live-badge">● LIVE</span>
        {isAdmin && <span className="admin-mode-badge">Admin Mode</span>}
      </div>

      {isAdmin ? <AdminBallotStation /> : <VoterBallot />}
    </div>
  )
}
