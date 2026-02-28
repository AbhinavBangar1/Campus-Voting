import { useState } from 'react'
import { useWeb3 } from './context/Web3Context'
import ConnectPanel from './components/ConnectPanel'
import TopBar from './components/TopBar'
import AdminPanel from './components/AdminPanel'
import VotingStation from './components/VotingStation'
import VoterRegistry from './components/VoterRegistry'
import BallotQueue from './components/BallotQueue'
import ResultsPanel from './components/ResultsPanel'

export default function App() {
  const { connected, selectedAccount, isAdmin, electionState } = useWeb3()
  const [activeTab, setActiveTab] = useState('vote')

  if (!connected || !selectedAccount) return <ConnectPanel />

  const es = electionState

  return (
    <div className="app">
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {es?.hasElection && (
          <div className="election-banner">
            <span>
              Election <strong>#{es.electionId}</strong>
              {' · '}
              {es.isActive && `Closes ${new Date(es.votingEnd * 1000).toLocaleString()}`}
              {es.isPending && `Opens ${new Date(es.votingStart * 1000).toLocaleString()}`}
              {es.isEnded && 'Ended · Results available'}
            </span>
            <span className={`status-badge ${es.isActive ? 'live' : es.isEnded ? 'ended' : 'pending'}`}>
              {es.isActive ? ' LIVE' : es.isEnded ? ' ENDED' : ' PENDING'}
            </span>
          </div>
        )}

        <div className="content-grid">
          {activeTab === 'vote'    && <VotingStation />}
          {activeTab === 'queue'   && isAdmin && <BallotQueue />}
          {activeTab === 'voters'  && isAdmin && <VoterRegistry />}
          {activeTab === 'admin'   && isAdmin && <AdminPanel />}
          {activeTab === 'results' && <ResultsPanel />}
        </div>
      </main>
    </div>
  )
}
