import { useWeb3 } from '../context/Web3Context'

const statusColor = { pending: 'pending', submitted: 'live', error: 'ended' }
const statusLabel = { pending: '⏳ Pending', submitted: '✓ On-Chain', error: '✕ Error' }

export default function BallotQueue() {
  const {
    ballotQueue, electionState, loading,
    autoSubmit, setAutoSubmit,
    submitBallot, submitAllPending, removeBallot,
    isAdmin,
  } = useWeb3()

  const es = electionState
  const pending   = ballotQueue.filter(b => b.status === 'pending')
  const submitted = ballotQueue.filter(b => b.status === 'submitted')
  const errors    = ballotQueue.filter(b => b.status === 'error')

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Ballot Queue</h2>
        {pending.length > 0 && (
          <span className="stat-chip warn">{pending.length} pending</span>
        )}
      </div>

      {/* Mode toggle */}
      {isAdmin && (
        <div className="form-card queue-mode-row">
          <div className="mode-toggle-group">
            <span className="mode-label">Submission Mode:</span>
            <button
              className={`mode-btn ${!autoSubmit ? 'active' : ''}`}
              onClick={() => setAutoSubmit(false)}
            >
               Manual
            </button>
            <button
              className={`mode-btn ${autoSubmit ? 'active' : ''}`}
              onClick={() => setAutoSubmit(true)}
            >
               Auto
            </button>
          </div>
          <p className="form-hint" style={{ marginTop: '0.5rem' }}>
            {autoSubmit
              ? 'Auto: each ballot is submitted to the blockchain immediately after voting.'
              : 'Manual: ballots collect here. Admin reviews and submits them.'}
          </p>

          {!autoSubmit && pending.length > 0 && (
            <button
              className="btn-primary"
              onClick={submitAllPending}
              disabled={loading}
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'Submitting…' : `Submit All ${pending.length} Pending`}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      {ballotQueue.length > 0 && (
        <div className="queue-stats">
          <div className="queue-stat">
            <span className="queue-stat-val accent2">{pending.length}</span>
            <span className="queue-stat-label">Pending</span>
          </div>
          <div className="queue-stat">
            <span className="queue-stat-val success">{submitted.length}</span>
            <span className="queue-stat-label">Submitted</span>
          </div>
          <div className="queue-stat">
            <span className="queue-stat-val danger">{errors.length}</span>
            <span className="queue-stat-label">Errors</span>
          </div>
        </div>
      )}

      {ballotQueue.length === 0 && (
        <div className="status-card center">
          <p className="muted">No ballots in queue yet.</p>
        </div>
      )}

      {ballotQueue.length > 0 && (
        <div className="queue-list">
          {ballotQueue.map(b => (
            <div className={`queue-item ${b.status}`} key={b.id}>

              <div className="queue-item-header">
                <div className="queue-voter-info">
                  <span className="queue-voter-name">
                    {b.voterName ?? b.voterId ?? 'Unknown'}
                  </span>
                  <span className="queue-voter-id">
                    {b.voterId ?? '—'}
                  </span>
                </div>
                <div className="queue-item-right">
                  <span className={`status-badge ${statusColor[b.status] ?? 'pending'}`}>
                    {statusLabel[b.status] ?? b.status}
                  </span>
                  <span className="queue-time">
                    {b.ts ? new Date(b.ts).toLocaleTimeString() : '—'}
                  </span>
                </div>
              </div>

              {Array.isArray(es?.posts) && Array.isArray(b.candidateIds) && (
                <div className="queue-selections">
                  {es.posts.map((post, i) => {
                    if (!post) return null
                    const pick = b.candidateIds[i]
                    return (
                      <span key={i} className="queue-sel-chip">
                        {post.name}:{' '}
                        <strong>
                          {pick !== undefined ? `C${pick + 1}` : '—'}
                        </strong>
                      </span>
                    )
                  })}
                </div>
              )}

              {b.status === 'error' && b.errMsg && (
                <div className="queue-error">{b.errMsg}</div>
              )}

              {isAdmin && b.status !== 'submitted' && (
                <div className="queue-actions">
                  {(b.status === 'pending' && !autoSubmit) && (
                    <button
                      className="btn-secondary"
                      onClick={() => submitBallot(b.id)}
                      disabled={loading}
                    >
                      Submit
                    </button>
                  )}
                  {b.status === 'error' && (
                    <button
                      className="btn-secondary"
                      onClick={() => submitBallot(b.id)}
                      disabled={loading}
                    >
                      ↺ Retry
                    </button>
                  )}
                  <button className="btn-ghost sm" onClick={() => removeBallot(b.id)}>
                    Remove
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
