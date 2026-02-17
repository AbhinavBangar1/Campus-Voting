using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.Web3;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts.CQS;
using Nethereum.Contracts.ContractHandlers;
using Nethereum.Contracts;
using System.Threading;
using CampusVoting.Contracts.CampusVoting.ContractDefinition;

namespace CampusVoting.Contracts.CampusVoting
{
    public partial class CampusVotingService: CampusVotingServiceBase
    {
        public static Task<TransactionReceipt> DeployContractAndWaitForReceiptAsync(Nethereum.Web3.IWeb3 web3, CampusVotingDeployment campusVotingDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            return web3.Eth.GetContractDeploymentHandler<CampusVotingDeployment>().SendRequestAndWaitForReceiptAsync(campusVotingDeployment, cancellationTokenSource);
        }

        public static Task<string> DeployContractAsync(Nethereum.Web3.IWeb3 web3, CampusVotingDeployment campusVotingDeployment)
        {
            return web3.Eth.GetContractDeploymentHandler<CampusVotingDeployment>().SendRequestAsync(campusVotingDeployment);
        }

        public static async Task<CampusVotingService> DeployContractAndGetServiceAsync(Nethereum.Web3.IWeb3 web3, CampusVotingDeployment campusVotingDeployment, CancellationTokenSource cancellationTokenSource = null)
        {
            var receipt = await DeployContractAndWaitForReceiptAsync(web3, campusVotingDeployment, cancellationTokenSource);
            return new CampusVotingService(web3, receipt.ContractAddress);
        }

        public CampusVotingService(Nethereum.Web3.IWeb3 web3, string contractAddress) : base(web3, contractAddress)
        {
        }

    }


    public partial class CampusVotingServiceBase: ContractWeb3ServiceBase
    {

        public CampusVotingServiceBase(Nethereum.Web3.IWeb3 web3, string contractAddress) : base(web3, contractAddress)
        {
        }

        public virtual Task<string> AddPostRequestAsync(AddPostFunction addPostFunction)
        {
             return ContractHandler.SendRequestAsync(addPostFunction);
        }

        public virtual Task<TransactionReceipt> AddPostRequestAndWaitForReceiptAsync(AddPostFunction addPostFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(addPostFunction, cancellationToken);
        }

        public virtual Task<string> AddPostRequestAsync(string name, BigInteger candidatecount)
        {
            var addPostFunction = new AddPostFunction();
                addPostFunction.Name = name;
                addPostFunction.Candidatecount = candidatecount;
            
             return ContractHandler.SendRequestAsync(addPostFunction);
        }

        public virtual Task<TransactionReceipt> AddPostRequestAndWaitForReceiptAsync(string name, BigInteger candidatecount, CancellationTokenSource cancellationToken = null)
        {
            var addPostFunction = new AddPostFunction();
                addPostFunction.Name = name;
                addPostFunction.Candidatecount = candidatecount;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(addPostFunction, cancellationToken);
        }

        public Task<string> AdminQueryAsync(AdminFunction adminFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<AdminFunction, string>(adminFunction, blockParameter);
        }

        
        public virtual Task<string> AdminQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<AdminFunction, string>(null, blockParameter);
        }

        public Task<BigInteger> CurrentElectionIdQueryAsync(CurrentElectionIdFunction currentElectionIdFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CurrentElectionIdFunction, BigInteger>(currentElectionIdFunction, blockParameter);
        }

        
        public virtual Task<BigInteger> CurrentElectionIdQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<CurrentElectionIdFunction, BigInteger>(null, blockParameter);
        }

        public virtual Task<GetPostOutputDTO> GetPostQueryAsync(GetPostFunction getPostFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryDeserializingToObjectAsync<GetPostFunction, GetPostOutputDTO>(getPostFunction, blockParameter);
        }

        public virtual Task<GetPostOutputDTO> GetPostQueryAsync(BigInteger electionId, BigInteger postId, BlockParameter blockParameter = null)
        {
            var getPostFunction = new GetPostFunction();
                getPostFunction.ElectionId = electionId;
                getPostFunction.PostId = postId;
            
            return ContractHandler.QueryDeserializingToObjectAsync<GetPostFunction, GetPostOutputDTO>(getPostFunction, blockParameter);
        }

        public Task<BigInteger> GetVotesQueryAsync(GetVotesFunction getVotesFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<GetVotesFunction, BigInteger>(getVotesFunction, blockParameter);
        }

        
        public virtual Task<BigInteger> GetVotesQueryAsync(BigInteger electionId, BigInteger postId, BigInteger candidateId, BlockParameter blockParameter = null)
        {
            var getVotesFunction = new GetVotesFunction();
                getVotesFunction.ElectionId = electionId;
                getVotesFunction.PostId = postId;
                getVotesFunction.CandidateId = candidateId;
            
            return ContractHandler.QueryAsync<GetVotesFunction, BigInteger>(getVotesFunction, blockParameter);
        }

        public Task<bool> HasVotedQueryAsync(HasVotedFunction hasVotedFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<HasVotedFunction, bool>(hasVotedFunction, blockParameter);
        }

        
        public virtual Task<bool> HasVotedQueryAsync(BigInteger returnValue1, byte[] returnValue2, BlockParameter blockParameter = null)
        {
            var hasVotedFunction = new HasVotedFunction();
                hasVotedFunction.ReturnValue1 = returnValue1;
                hasVotedFunction.ReturnValue2 = returnValue2;
            
            return ContractHandler.QueryAsync<HasVotedFunction, bool>(hasVotedFunction, blockParameter);
        }

        public Task<BigInteger> PostCountQueryAsync(PostCountFunction postCountFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<PostCountFunction, BigInteger>(postCountFunction, blockParameter);
        }

        
        public virtual Task<BigInteger> PostCountQueryAsync(BigInteger returnValue1, BlockParameter blockParameter = null)
        {
            var postCountFunction = new PostCountFunction();
                postCountFunction.ReturnValue1 = returnValue1;
            
            return ContractHandler.QueryAsync<PostCountFunction, BigInteger>(postCountFunction, blockParameter);
        }

        public virtual Task<string> StartNewElectionRequestAsync(StartNewElectionFunction startNewElectionFunction)
        {
             return ContractHandler.SendRequestAsync(startNewElectionFunction);
        }

        public virtual Task<TransactionReceipt> StartNewElectionRequestAndWaitForReceiptAsync(StartNewElectionFunction startNewElectionFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(startNewElectionFunction, cancellationToken);
        }

        public virtual Task<string> StartNewElectionRequestAsync(BigInteger start, BigInteger end)
        {
            var startNewElectionFunction = new StartNewElectionFunction();
                startNewElectionFunction.Start = start;
                startNewElectionFunction.End = end;
            
             return ContractHandler.SendRequestAsync(startNewElectionFunction);
        }

        public virtual Task<TransactionReceipt> StartNewElectionRequestAndWaitForReceiptAsync(BigInteger start, BigInteger end, CancellationTokenSource cancellationToken = null)
        {
            var startNewElectionFunction = new StartNewElectionFunction();
                startNewElectionFunction.Start = start;
                startNewElectionFunction.End = end;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(startNewElectionFunction, cancellationToken);
        }

        public virtual Task<string> VoteRequestAsync(VoteFunction voteFunction)
        {
             return ContractHandler.SendRequestAsync(voteFunction);
        }

        public virtual Task<TransactionReceipt> VoteRequestAndWaitForReceiptAsync(VoteFunction voteFunction, CancellationTokenSource cancellationToken = null)
        {
             return ContractHandler.SendRequestAndWaitForReceiptAsync(voteFunction, cancellationToken);
        }

        public virtual Task<string> VoteRequestAsync(byte[] voterHash, List<BigInteger> candidateIds)
        {
            var voteFunction = new VoteFunction();
                voteFunction.VoterHash = voterHash;
                voteFunction.CandidateIds = candidateIds;
            
             return ContractHandler.SendRequestAsync(voteFunction);
        }

        public virtual Task<TransactionReceipt> VoteRequestAndWaitForReceiptAsync(byte[] voterHash, List<BigInteger> candidateIds, CancellationTokenSource cancellationToken = null)
        {
            var voteFunction = new VoteFunction();
                voteFunction.VoterHash = voterHash;
                voteFunction.CandidateIds = candidateIds;
            
             return ContractHandler.SendRequestAndWaitForReceiptAsync(voteFunction, cancellationToken);
        }

        public Task<BigInteger> VotingEndQueryAsync(VotingEndFunction votingEndFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<VotingEndFunction, BigInteger>(votingEndFunction, blockParameter);
        }

        
        public virtual Task<BigInteger> VotingEndQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<VotingEndFunction, BigInteger>(null, blockParameter);
        }

        public Task<BigInteger> VotingStartQueryAsync(VotingStartFunction votingStartFunction, BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<VotingStartFunction, BigInteger>(votingStartFunction, blockParameter);
        }

        
        public virtual Task<BigInteger> VotingStartQueryAsync(BlockParameter blockParameter = null)
        {
            return ContractHandler.QueryAsync<VotingStartFunction, BigInteger>(null, blockParameter);
        }

        public override List<Type> GetAllFunctionTypes()
        {
            return new List<Type>
            {
                typeof(AddPostFunction),
                typeof(AdminFunction),
                typeof(CurrentElectionIdFunction),
                typeof(GetPostFunction),
                typeof(GetVotesFunction),
                typeof(HasVotedFunction),
                typeof(PostCountFunction),
                typeof(StartNewElectionFunction),
                typeof(VoteFunction),
                typeof(VotingEndFunction),
                typeof(VotingStartFunction)
            };
        }

        public override List<Type> GetAllEventTypes()
        {
            return new List<Type>
            {
                typeof(ElectionStartedEventDTO),
                typeof(VoteCastEventDTO)
            };
        }

        public override List<Type> GetAllErrorTypes()
        {
            return new List<Type>
            {

            };
        }
    }
}
