import { createContext, useContext, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import CampusVotingABI from '../abi/CampusVoting.json'

const HARDHAT_RPC = 'http://127.0.0.1:8545'
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'


const lsGet = (key, fb) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb } catch { return fb } }
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }
const voterKey = (eid) => `cv_voters_${eid}`
const queueKey = (eid) => `cv_queue_${eid}`

const Web3Context = createContext(null)

export function Web3Provider({ children }) {
  const [provider, setProvider]               = useState(null)
  const [contract, setContract]               = useState(null)
  const [adminContract, setAdminContract]     = useState(null)
  const [accounts, setAccounts]               = useState([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [adminAddress, setAdminAddress]       = useState('')
  const [isAdmin, setIsAdmin]                 = useState(false)
  const [connected, setConnected]             = useState(false)
  const [electionState, setElectionState]     = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [txMsg, setTxMsg]                     = useState('')
  const [eligibleVoters, setEligibleVoters]   = useState([])
  const [ballotQueue, setBallotQueue]         = useState([])
  const [autoSubmit, setAutoSubmit]           = useState(false)

  const notify = (msg) => { setTxMsg(msg); setTimeout(() => setTxMsg(''), 6000) }

  const connect = useCallback(async () => {
    try {
      setLoading(true)
      const prov = new ethers.JsonRpcProvider(HARDHAT_RPC)
      await prov.getNetwork()
      const accs = await prov.listAccounts()
      if (!accs.length) throw new Error('No accounts on node')
      const addresses = await Promise.all(accs.map(a => a.getAddress()))
      setAccounts(addresses)
      setProvider(prov)
      setConnected(true)
    } catch (e) {
      alert(`Cannot connect to Hardhat node at ${HARDHAT_RPC}.\nRun: npx hardhat node\n\n${e.message}`)
    } finally { setLoading(false) }
  }, [])

  const selectAccount = useCallback(async (address) => {
    if (!provider) return
    const s = await provider.getSigner(address)
    const c = new ethers.Contract(CONTRACT_ADDRESS, CampusVotingABI, s)
    setContract(c)
    setSelectedAccount(address)

    const admin = await c.admin()
    setAdminAddress(admin)
    const isAdm = admin.toLowerCase() === address.toLowerCase()
    setIsAdmin(isAdm)


    const adminSigner = await provider.getSigner(admin)
    const adminC = new ethers.Contract(CONTRACT_ADDRESS, CampusVotingABI, adminSigner)
    setAdminContract(adminC)

    await _refreshState(c, adminC)
  }, [provider])

  const _refreshState = useCallback(async (c, adminC) => {
    const inst = c || contract
    if (!inst) return
    try {
      const eid    = await inst.currentElectionId()
      const vStart = await inst.votingStart()
      const vEnd   = await inst.votingEnd()
      const pCount = eid > 0n ? await inst.postCount(eid) : 0n
      const now    = BigInt(Math.floor(Date.now() / 1000))

      const posts = []
      for (let i = 0n; i < pCount; i++) {
        const [name, candidateCount] = await inst.getPost(eid, i)
        posts.push({ id: Number(i), name, candidateCount: Number(candidateCount) })
      }

      const state = {
        electionId:  Number(eid),
        votingStart: Number(vStart),
        votingEnd:   Number(vEnd),
        postCount:   Number(pCount),
        posts,
        isActive:    now >= vStart && now <= vEnd && vStart > 0n,
        isEnded:     vEnd > 0n && now > vEnd,
        hasElection: eid > 0n,
        isPending:   vStart > 0n && now < vStart,
      }
      setElectionState(state)

      if (Number(eid) > 0) {
        setEligibleVoters(lsGet(voterKey(Number(eid)), []))
        setBallotQueue(lsGet(queueKey(Number(eid)), []))
      }
    } catch (e) { console.error('refreshState:', e) }
  }, [contract])

  const refreshElectionState = useCallback(() => _refreshState(), [_refreshState])


  const startNewElection = useCallback(async (startTs, endTs) => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.startNewElection(startTs, endTs)
      notify('Starting election…')
      await tx.wait()
      notify('New election started!')
      await _refreshState()
    } catch (e) { notify(`${e.reason || e.message}`) }
    finally { setLoading(false) }
  }, [contract, _refreshState])

  const stopElection = useCallback(async () => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.stopElection()
      notify('Stopping election…')
      await tx.wait()
      notify('Election stopped.')
      await _refreshState()
    } catch (e) { notify(`${e.reason || e.message}`) }
    finally { setLoading(false) }
  }, [contract, _refreshState])

  const addPost = useCallback(async (name, candidateCount) => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.addPost(name, candidateCount)
      notify('Adding post…')
      await tx.wait()
      notify(`Post "${name}" added!`)
      await _refreshState()
    } catch (e) { notify(`${e.reason || e.message}`) }
    finally { setLoading(false) }
  }, [contract, _refreshState])


  const addVoter = useCallback((voter) => {
    if (!electionState) return
    setEligibleVoters(prev => {
      if (prev.find(v => v.id === voter.id)) { notify('⚠ Voter ID already registered.'); return prev }
      const next = [...prev, { ...voter, votedOnChain: false, queued: false }]
      lsSet(voterKey(electionState.electionId), next)
      return next
    })
  }, [electionState])

  const removeVoter = useCallback((voterId) => {
    if (!electionState) return
    setEligibleVoters(prev => {
      const next = prev.filter(v => v.id !== voterId)
      lsSet(voterKey(electionState.electionId), next)
      return next
    })
  }, [electionState])

  const importVoters = useCallback((voters) => {
    if (!electionState) return
    setEligibleVoters(prev => {
      const existing = new Set(prev.map(v => v.id))
      const fresh = voters.filter(v => !existing.has(v.id))
      const next = [...prev, ...fresh.map(v => ({ ...v, votedOnChain: false, queued: false }))]
      lsSet(voterKey(electionState.electionId), next)
      return next
    })
    notify('Voters imported.')
  }, [electionState])


  const checkVoterStatus = useCallback(async (voterId) => {
    const inst = contract
    if (!inst || !electionState) return false
    const voterHash = ethers.solidityPackedKeccak256(
      ['string', 'uint256'], [voterId, electionState.electionId]
    )
    return await inst.hasVoted(electionState.electionId, voterHash)
  }, [contract, electionState])


  const enqueueBallot = useCallback(async (voterId, voterName, candidateIds) => {
    if (!electionState) return false

    // Check on-chain already voted (use read-only contract — any signer works for view)
    const inst = contract
    const voterHash = ethers.solidityPackedKeccak256(
      ['string', 'uint256'], [voterId, electionState.electionId]
    )
    try {
      const alreadyVoted = await inst.hasVoted(electionState.electionId, voterHash)
      if (alreadyVoted) { notify('This voter has already voted on-chain.'); return false }
    } catch (e) {  }

    const existingInQueue = ballotQueue.find(
      b => b.voterId === voterId && b.status !== 'error'
    )
    if (existingInQueue) { notify('This voter already has a pending ballot in the queue.'); return false }

    const ballot = {
      id: Date.now(),
      voterId,
      voterName: voterName || voterId,
      candidateIds,
      status: 'pending',
      ts: Date.now(),
    }

    const nextQueue = [...ballotQueue, ballot]
    setBallotQueue(nextQueue)
    lsSet(queueKey(electionState.electionId), nextQueue)

    setEligibleVoters(prev => {
      const next = prev.map(v => v.id === voterId ? { ...v, queued: true } : v)
      lsSet(voterKey(electionState.electionId), next)
      return next
    })

    if (autoSubmit) {

      await _submitBallot(ballot, nextQueue)
    } else {
      notify('Ballot queued — admin will submit from the Queue tab.')
    }
    return true
  }, [contract, electionState, ballotQueue, autoSubmit])

  const _submitBallot = useCallback(async (ballot, currentQueue) => {

    const inst = adminContract
    if (!inst) { notify(' Admin contract not available. Are you connected as admin?'); return }

    const voterHash = ethers.solidityPackedKeccak256(
      ['string', 'uint256'], [ballot.voterId, electionState.electionId]
    )

    const updateQueue = (status, errMsg) => {
      setBallotQueue(prev => {
        const next = prev.map(b => b.id === ballot.id ? { ...b, status, errMsg } : b)
        lsSet(queueKey(electionState.electionId), next)
        return next
      })
    }

    const markVoterVoted = () => {
      setEligibleVoters(prev => {
        const next = prev.map(v => v.id === ballot.voterId
          ? { ...v, votedOnChain: true, queued: false } : v)
        lsSet(voterKey(electionState.electionId), next)
        return next
      })
    }

    try {
      notify(`⏳ Submitting ballot for ${ballot.voterName}…`)
      const tx = await inst.vote(voterHash, ballot.candidateIds)
      await tx.wait()
      updateQueue('submitted')
      markVoterVoted()
      notify(`${ballot.voterName}'s ballot confirmed on-chain!`)
    } catch (e) {
      updateQueue('error', e.reason || e.message)
      notify(`${e.reason || e.message}`)
    }
  }, [adminContract, electionState])

  const submitBallot = useCallback(async (ballotId) => {
    const ballot = ballotQueue.find(b => b.id === ballotId)
    if (!ballot) return
    setLoading(true)
    await _submitBallot(ballot)
    setLoading(false)
  }, [ballotQueue, _submitBallot])

  const submitAllPending = useCallback(async () => {
    const pending = ballotQueue.filter(b => b.status === 'pending')
    if (!pending.length) { notify('No pending ballots.'); return }
    setLoading(true)
    for (const ballot of pending) {
      await _submitBallot(ballot)
    }
    setLoading(false)
  }, [ballotQueue, _submitBallot])

  const removeBallot = useCallback((ballotId) => {
    setBallotQueue(prev => {
      const ballot = prev.find(b => b.id === ballotId)
      const next = prev.filter(b => b.id !== ballotId)
      if (electionState) lsSet(queueKey(electionState.electionId), next)
      if (ballot) {
        setEligibleVoters(vPrev => {
          const vNext = vPrev.map(v => v.id === ballot.voterId ? { ...v, queued: false } : v)
          if (electionState) lsSet(voterKey(electionState.electionId), vNext)
          return vNext
        })
      }
      return next
    })
  }, [electionState])


  const getResults = useCallback(async () => {
    if (!contract || !electionState) return []
    const results = []
    for (const post of electionState.posts) {
      const voteCounts = []
      for (let c = 0; c < post.candidateCount; c++) {
        const v = await contract.getVotes(electionState.electionId, post.id, c)
        voteCounts.push(Number(v))
      }
      results.push({ ...post, voteCounts })
    }
    return results
  }, [contract, electionState])

  return (
    <Web3Context.Provider value={{
      connected, accounts, selectedAccount, adminAddress, isAdmin, loading, txMsg,
      electionState, contract,
      connect, selectAccount, refreshElectionState,
      startNewElection, stopElection, addPost,
      eligibleVoters, addVoter, removeVoter, importVoters, checkVoterStatus,
      ballotQueue, autoSubmit, setAutoSubmit,
      enqueueBallot, submitBallot, submitAllPending, removeBallot,
      getResults,
    }}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)
