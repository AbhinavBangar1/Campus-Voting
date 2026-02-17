// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampusVoting {
    address public admin;

    uint256 public votingStart;
    uint256 public votingEnd;
    uint256 public currentElectionId;

    struct Post {
        string name;
        uint256 candidateCount;
        mapping(uint256 => uint256) votes;
    }

    // electionId => postId => Post
    mapping(uint256 => mapping(uint256 => Post)) private posts;

    // electionId => number of posts
    mapping(uint256 => uint256) public postCount;

    // electionId => voterHash => voted?
    mapping(uint256 => mapping(bytes32 => bool)) public hasVoted;


    event ElectionStarted(
        uint256 indexed electionId,
        uint256 votingStart,
        uint256 votingEnd
    );

    event ElectionStopped(
        uint256 indexed electionId,
        uint256 stoppedAt
    );

    event VoteCast(
        uint256 indexed electionId,
        bytes32 indexed voterHash,
        uint256 indexed postId,
        uint256 candidateId
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier votingOpen() {
        require(
            block.timestamp >= votingStart &&
            block.timestamp <= votingEnd,
            "Voting closed"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function startNewElection(
        uint256 _start,
        uint256 _end
    ) external onlyAdmin {
        require(_start < _end, "Invalid time");
        // Allow starting a new election only if no active one exists
        require(
            currentElectionId == 0 || block.timestamp > votingEnd,
            "Current election still active"
        );

        currentElectionId++;
        votingStart = _start;
        votingEnd = _end;

        emit ElectionStarted(currentElectionId, _start, _end);
    }

    /// @notice Admin can end the current election early
    function stopElection() external onlyAdmin {
        require(currentElectionId > 0, "No election exists");
        require(block.timestamp >= votingStart, "Election not started yet");
        require(block.timestamp <= votingEnd, "Election already ended");

        votingEnd = block.timestamp;

        emit ElectionStopped(currentElectionId, block.timestamp);
    }

    function addPost(
        string calldata name,
        uint256 candidateCount_
    ) external onlyAdmin {
        require(currentElectionId > 0, "No election created yet");
        require(block.timestamp < votingStart, "Voting already started");
        require(candidateCount_ > 0, "No candidates");

        uint256 pId = postCount[currentElectionId];
        Post storage p = posts[currentElectionId][pId];
        p.name = name;
        p.candidateCount = candidateCount_;

        postCount[currentElectionId]++;
    }

    /**
     * @param voterHash  generated off-chain (must include electionId)
     * @param candidateIds  index = postId, value = candidateId
     */
    function vote(
        bytes32 voterHash,
        uint256[] calldata candidateIds
    )
        external
        onlyAdmin
        votingOpen
    {
        uint256 eid = currentElectionId;

        require(!hasVoted[eid][voterHash], "Already voted");
        require(
            candidateIds.length == postCount[eid],
            "Invalid ballot"
        );

        hasVoted[eid][voterHash] = true;

        for (uint256 i = 0; i < candidateIds.length; i++) {
            require(
                candidateIds[i] < posts[eid][i].candidateCount,
                "Invalid candidate"
            );
            posts[eid][i].votes[candidateIds[i]] += 1;
            emit VoteCast(eid, voterHash, i, candidateIds[i]);
        }
    }

    function getPost(
        uint256 electionId,
        uint256 postId
    )
        external
        view
        returns (string memory name, uint256 candidateCount_)
    {
        Post storage p = posts[electionId][postId];
        return (p.name, p.candidateCount);
    }

    function getVotes(
        uint256 electionId,
        uint256 postId,
        uint256 candidateId
    )
        external
        view
        returns (uint256)
    {
        require(block.timestamp > votingEnd, "Results not available yet");
        return posts[electionId][postId].votes[candidateId];
    }
}
