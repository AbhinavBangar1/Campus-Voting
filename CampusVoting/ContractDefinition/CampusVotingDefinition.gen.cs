using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Numerics;
using Nethereum.Hex.HexTypes;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Contracts.CQS;
using Nethereum.Contracts;
using System.Threading;
using CampusVoting.Contracts.CampusVoting.ContractDefinition;

namespace CampusVoting.Contracts.CampusVoting.ContractDefinition
{


    public partial class CampusVotingDeployment : CampusVotingDeploymentBase
    {
        public CampusVotingDeployment() : base(BYTECODE) { }
        public CampusVotingDeployment(string byteCode) : base(byteCode) { }
    }

    public class CampusVotingDeploymentBase : ContractDeploymentMessage
    {
        public static string BYTECODE = "608080604052346026575f80546001600160a01b03191633179055610974908161002b8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c908163101158af1461086c57508063284837881461084257806349dc8fc21461079a57806366ea76d51461056057806374417bf414610525578063809b2cb1146104915780638118d9371461020e57806385a38635146101f157806398ecf2a0146101d4578063c4c9a9c0146100c05763f851a44014610095575f80fd5b346100bc575f3660031901126100bc575f546040516001600160a01b039091168152602090f35b5f80fd5b346100bc576100ce36610886565b905f52600460205260405f20905f5260205260405f2060018101546040515f8354936100f9856108e2565b9081845260208401956001811690815f146101b95750600114610181575b5050819003601f01601f191681019267ffffffffffffffff84118285101761016d57606092849283604052604084525180928160408601528585015e5f8383018501526020830152601f01601f19168101030190f35b634e487b7160e01b5f52604160045260245ffd5b9091505f5260205f205f905b8282106101a35750602091508201018480610117565b600181602092548385880101520191019061018d565b60ff191687525050151560051b820160200190508480610117565b346100bc575f3660031901126100bc576020600354604051908152f35b346100bc575f3660031901126100bc576020600254604051908152f35b346100bc5760403660031901126100bc5760243560043567ffffffffffffffff82116100bc57366023830112156100bc57816004013567ffffffffffffffff81116100bc576024830192602436918360051b0101116100bc5761027b60018060a01b035f5416331461089c565b60015442101580610485575b156104505760035491825f52600660205260405f20815f5260205260ff60405f20541661041b57825f52600560205260405f205482036103e557825f52600660205260405f20815f5260205260405f20600160ff198254161790555f5b8281106102ed57005b6102f881848761091a565b35845f52600460205260405f20825f52602052600160405f20015411156103ac57835f52600460205260405f20815f52602052600260405f200161033d82858861091a565b355f5260205260405f209081546001810180911161039857600192558083867fcfae062665f1d6c54f3e6b39d42ed7072e049935d0f59c54827710486bdcda5d602061038a858a8d61091a565b35604051908152a4016102e4565b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b8152602060048201526011602482015270496e76616c69642063616e64696461746560781b6044820152606490fd5b60405162461bcd60e51b815260206004820152600e60248201526d125b9d985b1a590818985b1b1bdd60921b6044820152606490fd5b60405162461bcd60e51b815260206004820152600d60248201526c105b1c9958591e481d9bdd1959609a1b6044820152606490fd5b60405162461bcd60e51b815260206004820152600d60248201526c159bdd1a5b99c818db1bdcd959609a1b6044820152606490fd5b50600254421115610287565b346100bc5760603660031901126100bc576002544211156104e0576004355f52600460205260405f206024355f52602052600260405f20016044355f52602052602060405f2054604051908152f35b60405162461bcd60e51b815260206004820152601960248201527f526573756c7473206e6f7420617661696c61626c6520796574000000000000006044820152606490fd5b346100bc5760403660031901126100bc576004355f52600660205260405f206024355f52602052602060ff60405f2054166040519015158152f35b346100bc5760403660031901126100bc5760043567ffffffffffffffff81116100bc57366023820112156100bc57806004013567ffffffffffffffff81116100bc5736602482840101116100bc57602435906105c660018060a01b035f5416331461089c565b60015442101561075c57811561072757600354805f52600560205260405f2054905f52600460205260405f20905f5260205260405f209061060782546108e2565b601f81116106d6575b505f93601f821160011461066a576001939482915f9261065c575b50505f19600383901b1c191690831b1781555b01556003545f52600560205260405f2061065881546108d4565b9055005b60249250010135858061062b565b601f19821694835f5260205f20955f5b8181106106bb5750916001959691848795941061069f575b505050811b01815561063e565b01602401355f19600384901b60f8161c19169055858080610692565b919660206001819260248b880101358155019801920161067a565b8181111561061057825f5260205f20601f830160051c906020841061071f575b81601f9101920160051c03905f5b828110610712575050610610565b5f82820155600101610704565b5f91506106f6565b60405162461bcd60e51b815260206004820152600d60248201526c4e6f2063616e6469646174657360981b6044820152606490fd5b60405162461bcd60e51b8152602060048201526016602482015275159bdd1a5b99c8185b1c9958591e481cdd185c9d195960521b6044820152606490fd5b346100bc576107a836610886565b906107bd60018060a01b035f5416331461089c565b8181101561080e5760407f05c86f625f5abd1385c78f66fa5cae221087d7ef4e0a8b37efdfd0592c85a759916107f46003546108d4565b9384600355816001558060025582519182526020820152a2005b60405162461bcd60e51b815260206004820152600c60248201526b496e76616c69642074696d6560a01b6044820152606490fd5b346100bc5760203660031901126100bc576004355f526005602052602060405f2054604051908152f35b346100bc575f3660031901126100bc576020906001548152f35b60409060031901126100bc576004359060243590565b156108a357565b60405162461bcd60e51b81526020600482015260096024820152682737ba1030b236b4b760b91b6044820152606490fd5b5f1981146103985760010190565b90600182811c92168015610910575b60208310146108fc57565b634e487b7160e01b5f52602260045260245ffd5b91607f16916108f1565b919081101561092a5760051b0190565b634e487b7160e01b5f52603260045260245ffdfea2646970667358221220a7caf4570f0ee81221127337b54521483aad1996249efae3edde355f2d86e29064736f6c63430008210033";
        public CampusVotingDeploymentBase() : base(BYTECODE) { }
        public CampusVotingDeploymentBase(string byteCode) : base(byteCode) { }

    }

    public partial class AddPostFunction : AddPostFunctionBase { }

    [Function("addPost")]
    public class AddPostFunctionBase : FunctionMessage
    {
        [Parameter("string", "name", 1)]
        public virtual string Name { get; set; }
        [Parameter("uint256", "candidateCount_", 2)]
        public virtual BigInteger Candidatecount { get; set; }
    }

    public partial class AdminFunction : AdminFunctionBase { }

    [Function("admin", "address")]
    public class AdminFunctionBase : FunctionMessage
    {

    }

    public partial class CurrentElectionIdFunction : CurrentElectionIdFunctionBase { }

    [Function("currentElectionId", "uint256")]
    public class CurrentElectionIdFunctionBase : FunctionMessage
    {

    }

    public partial class GetPostFunction : GetPostFunctionBase { }

    [Function("getPost", typeof(GetPostOutputDTO))]
    public class GetPostFunctionBase : FunctionMessage
    {
        [Parameter("uint256", "electionId", 1)]
        public virtual BigInteger ElectionId { get; set; }
        [Parameter("uint256", "postId", 2)]
        public virtual BigInteger PostId { get; set; }
    }

    public partial class GetVotesFunction : GetVotesFunctionBase { }

    [Function("getVotes", "uint256")]
    public class GetVotesFunctionBase : FunctionMessage
    {
        [Parameter("uint256", "electionId", 1)]
        public virtual BigInteger ElectionId { get; set; }
        [Parameter("uint256", "postId", 2)]
        public virtual BigInteger PostId { get; set; }
        [Parameter("uint256", "candidateId", 3)]
        public virtual BigInteger CandidateId { get; set; }
    }

    public partial class HasVotedFunction : HasVotedFunctionBase { }

    [Function("hasVoted", "bool")]
    public class HasVotedFunctionBase : FunctionMessage
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
        [Parameter("bytes32", "", 2)]
        public virtual byte[] ReturnValue2 { get; set; }
    }

    public partial class PostCountFunction : PostCountFunctionBase { }

    [Function("postCount", "uint256")]
    public class PostCountFunctionBase : FunctionMessage
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }

    public partial class StartNewElectionFunction : StartNewElectionFunctionBase { }

    [Function("startNewElection")]
    public class StartNewElectionFunctionBase : FunctionMessage
    {
        [Parameter("uint256", "_start", 1)]
        public virtual BigInteger Start { get; set; }
        [Parameter("uint256", "_end", 2)]
        public virtual BigInteger End { get; set; }
    }

    public partial class VoteFunction : VoteFunctionBase { }

    [Function("vote")]
    public class VoteFunctionBase : FunctionMessage
    {
        [Parameter("bytes32", "voterHash", 1)]
        public virtual byte[] VoterHash { get; set; }
        [Parameter("uint256[]", "candidateIds", 2)]
        public virtual List<BigInteger> CandidateIds { get; set; }
    }

    public partial class VotingEndFunction : VotingEndFunctionBase { }

    [Function("votingEnd", "uint256")]
    public class VotingEndFunctionBase : FunctionMessage
    {

    }

    public partial class VotingStartFunction : VotingStartFunctionBase { }

    [Function("votingStart", "uint256")]
    public class VotingStartFunctionBase : FunctionMessage
    {

    }



    public partial class AdminOutputDTO : AdminOutputDTOBase { }

    [FunctionOutput]
    public class AdminOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("address", "", 1)]
        public virtual string ReturnValue1 { get; set; }
    }

    public partial class CurrentElectionIdOutputDTO : CurrentElectionIdOutputDTOBase { }

    [FunctionOutput]
    public class CurrentElectionIdOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }

    public partial class GetPostOutputDTO : GetPostOutputDTOBase { }

    [FunctionOutput]
    public class GetPostOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("string", "name", 1)]
        public virtual string Name { get; set; }
        [Parameter("uint256", "candidateCount_", 2)]
        public virtual BigInteger Candidatecount { get; set; }
    }

    public partial class GetVotesOutputDTO : GetVotesOutputDTOBase { }

    [FunctionOutput]
    public class GetVotesOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }

    public partial class HasVotedOutputDTO : HasVotedOutputDTOBase { }

    [FunctionOutput]
    public class HasVotedOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("bool", "", 1)]
        public virtual bool ReturnValue1 { get; set; }
    }

    public partial class PostCountOutputDTO : PostCountOutputDTOBase { }

    [FunctionOutput]
    public class PostCountOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }





    public partial class VotingEndOutputDTO : VotingEndOutputDTOBase { }

    [FunctionOutput]
    public class VotingEndOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }

    public partial class VotingStartOutputDTO : VotingStartOutputDTOBase { }

    [FunctionOutput]
    public class VotingStartOutputDTOBase : IFunctionOutputDTO 
    {
        [Parameter("uint256", "", 1)]
        public virtual BigInteger ReturnValue1 { get; set; }
    }

    public partial class ElectionStartedEventDTO : ElectionStartedEventDTOBase { }

    [Event("ElectionStarted")]
    public class ElectionStartedEventDTOBase : IEventDTO
    {
        [Parameter("uint256", "electionId", 1, true )]
        public virtual BigInteger ElectionId { get; set; }
        [Parameter("uint256", "votingStart", 2, false )]
        public virtual BigInteger VotingStart { get; set; }
        [Parameter("uint256", "votingEnd", 3, false )]
        public virtual BigInteger VotingEnd { get; set; }
    }

    public partial class VoteCastEventDTO : VoteCastEventDTOBase { }

    [Event("VoteCast")]
    public class VoteCastEventDTOBase : IEventDTO
    {
        [Parameter("uint256", "electionId", 1, true )]
        public virtual BigInteger ElectionId { get; set; }
        [Parameter("bytes32", "voterHash", 2, true )]
        public virtual byte[] VoterHash { get; set; }
        [Parameter("uint256", "postId", 3, true )]
        public virtual BigInteger PostId { get; set; }
        [Parameter("uint256", "candidateId", 4, false )]
        public virtual BigInteger CandidateId { get; set; }
    }
}
