import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'

export default function ResultsPanel() {
  const { electionState, getResults, loading } = useWeb3()
  const [results, setResults] = useState([])
  const [fetched, setFetched] = useState(false)
  const [fetching, setFetching] = useState(false)

  const es = electionState

  const fetchResults = async () => {
    setFetching(true)
    try {
      const r = await getResults()
      setResults(r)
      setFetched(true)
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (es?.isEnded && !fetched) {
      fetchResults()
    }
  }, [es?.isEnded])

  if (!es?.hasElection) return null

  const canView = es?.isEnded

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Results</h2>
        {canView && (
          <button className="btn-ghost sm" onClick={fetchResults} disabled={fetching}>
            {fetching ? 'Loading…' : '↺ Refresh'}
          </button>
        )}
      </div>

      {!canView && (
        <div className="status-card center">
          <p className="muted">
            Results will be available after voting closes on{' '}
            <strong>{new Date(es.votingEnd * 1000).toLocaleString()}</strong>.
          </p>
        </div>
      )}

      {canView && !fetched && (
        <div className="status-card center">
          <button className="btn-primary" onClick={fetchResults} disabled={fetching}>
            {fetching ? 'Loading Results…' : 'Load Results'}
          </button>
        </div>
      )}

      {fetched && results.map(post => {
        const total = post.voteCounts.reduce((a, b) => a + b, 0)
        const maxVotes = Math.max(...post.voteCounts, 1)
        const winnerId = post.voteCounts.indexOf(maxVotes)

        return (
          <div className="result-card" key={post.id}>
            <div className="result-post-header">
              <span className="post-index">Post {post.id}</span>
              <h3 className="result-post-name">{post.name}</h3>
              <span className="result-total">{total} total votes</span>
            </div>
            <div className="result-candidates">
              {post.voteCounts.map((votes, c) => {
                const pct = total > 0 ? Math.round((votes / total) * 100) : 0
                const isWinner = c === winnerId && total > 0
                return (
                  <div className={`result-row ${isWinner ? 'winner' : ''}`} key={c}>
                    <div className="result-row-top">
                      <span className="result-candidate">
                        {isWinner && <span className="winner-crown">★ </span>}
                        Candidate {c + 1}
                        <span className="candidate-id">#{c}</span>
                      </span>
                      <span className="result-pct">{pct}%</span>
                      <span className="result-votes">{votes} votes</span>
                    </div>
                    <div className="result-bar-bg">
                      <div
                        className={`result-bar ${isWinner ? 'winner-bar' : ''}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
