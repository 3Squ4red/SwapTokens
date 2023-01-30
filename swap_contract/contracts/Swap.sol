// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface Token {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);
}

struct Proposal {
    uint id;
    address proposer;
    address token1;
    uint256 amount1;
    address token2;
    uint256 amount2;
    bool isClosed;
}

contract Swap {

    uint id;
    mapping(address => mapping(uint=>Proposal)) public proposals;
    Proposal[] public proposalsArr;

    // Before calling this function, the caller has to call the
    // approve(spender, amount) on the token1 contract
    // where `spender` should be this contract's address and `amount` should be >= amount1
    function open(
        address _token1,
        uint256 _amount1,
        address _token2,
        uint256 _amount2
    ) external {
        // Validating parameters
        require(_token1 != _token2, "both tokens cannot be same");
        require(address(_token1) != address(0), "token is a zero address");
        require(_amount1 > 0 && _amount2 > 0, "amounts cannot be zero");

        address caller = msg.sender;
        // Transfer _amount1 unit of _token1 token from the caller to this contract
        IERC20(_token1).transferFrom(caller, address(this), _amount1);

        // Create a new proposal
        Proposal memory prp = Proposal(id, caller, _token1, _amount1, _token2, _amount2, false);
        proposals[caller][id++] = prp;

        // Finally push the new proposal
        proposalsArr.push(prp);
    }

    // Before calling this function, the caller has to call the
    // approve(spender, amount) on the token2 contract
    // where `spender` should be this contract's address and `amount` should be >= amount2
    function close(address proposer, uint256 pId) external {
        require(proposer != address(0), "proposer is zero");

        // the change will not reflect on the mapping with `memory`
        Proposal storage proposal = proposals[proposer][pId];

        require(proposal.proposer != msg.sender, "can't close your own proposal");
        require(!proposal.isClosed, "proposal is closed");

        // Make the transfers
        // Contract -> Closer
        IERC20(proposal.token1).transfer(msg.sender, proposal.amount1);
        // Closer -> proposer
        IERC20(proposal.token2).transferFrom(
            msg.sender,
            proposer,
            proposal.amount2
        );

        // Finally close the proposal
        proposal.isClosed = true;

        for(uint i = 0; i < proposalsArr.length; i++) {
            if(proposalsArr[i].id == proposal.id) {
                proposalsArr[i].isClosed = true;
                break;
            }
        }
    }

    // This will close a swap proposal of the caller
    // And return the tokens to the caller
    function cancel(uint pId) external {
        address caller = msg.sender;

        Proposal storage proposal =  proposals[caller][pId];

        // Return the tokens
        IERC20(proposal.token1).transfer(caller, proposal.amount1);

       proposal.isClosed = true;

        for(uint i = 0; i < proposalsArr.length; i++) {
            if(proposalsArr[i].id == proposal.id) {
                proposalsArr[i].isClosed = true;
                break;
            }
        }
    }

    // Will be used to fetch all the proposals
    function getAllProposals() external view returns(Proposal[] memory) {
        return proposalsArr;
    }

    function getTokenDetails(address token)
        external
        view
        returns (string memory name, string memory symbol)
    {
        Token t = Token(token);
        name = t.name();
        symbol = t.symbol();
    }
}
