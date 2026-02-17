import { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'

export default function ConnectPanel() {
  const { connected, accounts, selectedAccount, adminAddress, isAdmin, connect, selectAccount, loading } = useWeb3()
  const [chosen, setChosen] = useState('')

  if (!connected) {
    return (
      <div className="connect-screen">
        <div className="connect-card">
          <div className="logo-mark">⬡</div>
          <h1 className="connect-title">CampusVote</h1>
          <p className="connect-subtitle">Decentralized Election Terminal</p>
          <div className="connect-divider" />
          <p className="connect-info">
            Connects to your local Hardhat node at{' '}
            <code>127.0.0.1:8545</code>
          </p>
          <button className="btn-primary btn-large" onClick={connect} disabled={loading}>
            {loading ? 'Connecting…' : 'Connect to Node'}
          </button>
          <p className="connect-hint">Make sure <code>npx hardhat node</code> is running</p>
        </div>
      </div>
    )
  }

  if (!selectedAccount) {
    return (
      <div className="connect-screen">
        <div className="connect-card wide">
          <div className="logo-mark">⬡</div>
          <h2 className="connect-title sm">Select Wallet Account</h2>
          <p className="connect-subtitle">Choose one of your Hardhat accounts</p>
          <div className="connect-divider" />
          <div className="account-list">
            {accounts.map((addr, i) => (
              <label key={addr} className={`account-row ${chosen === addr ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="account"
                  value={addr}
                  checked={chosen === addr}
                  onChange={() => setChosen(addr)}
                />
                <span className="account-index">#{i}</span>
                <span className="account-addr">{addr}</span>
                {i === 0 && <span className="account-badge">Deployer</span>}
              </label>
            ))}
          </div>
          <button
            className="btn-primary btn-large"
            disabled={!chosen || loading}
            onClick={() => selectAccount(chosen)}
          >
            {loading ? 'Loading…' : 'Enter DApp →'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
