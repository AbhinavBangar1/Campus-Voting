import { useWeb3 } from '../context/Web3Context'

export default function TopBar({ activeTab, setActiveTab }) {
  const { selectedAccount, isAdmin, electionState, txMsg, refreshElectionState, loading, ballotQueue } = useWeb3()

  const short = addr => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''
  const pendingCount = ballotQueue.filter(b => b.status === 'pending').length

  const tabs = [
    { id: 'vote',    label: 'Vote',    adminOnly: false },
    { id: 'queue',   label: 'Queue',   adminOnly: true,  badge: pendingCount },
    { id: 'voters',  label: 'Voters',  adminOnly: true  },
    { id: 'admin',   label: 'Admin',   adminOnly: true  },
    { id: 'results', label: 'Results', adminOnly: false },
  ]

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-logo">⬡</span>
          <span className="topbar-brand">CampusVote</span>
          {electionState?.isActive && <span className="live-pill">● LIVE</span>}
        </div>

        <nav className="topbar-nav">
          {tabs.map(tab => {
            if (tab.adminOnly && !isAdmin) return null
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.badge > 0 && <span className="tab-badge">{tab.badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="topbar-right">
          <button className="refresh-btn" onClick={refreshElectionState} disabled={loading} title="Refresh">
            {loading ? '…' : '↺'}
          </button>
          <div className="wallet-chip">
            <span className={`wallet-dot ${isAdmin ? 'admin' : 'voter'}`} />
            <span className="wallet-addr">{short(selectedAccount)}</span>
            {isAdmin && <span className="admin-tag">Admin</span>}
          </div>
        </div>
      </header>

      {txMsg && (
        <div className={`tx-toast ${txMsg.startsWith('❌') ? 'err' : txMsg.startsWith('⚠') ? 'warn' : 'ok'}`}>
          {txMsg}
        </div>
      )}
    </>
  )
}
