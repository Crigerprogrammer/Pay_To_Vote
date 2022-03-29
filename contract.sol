// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

//First need to create the contract
contract PayToVote{
    address payable beneficiary; //wallet beneficiary
    address highetsPlayer; //First place player
    uint256 higestVote; //Higest amount 

    //Constructor initialization
    constructor (
        address payable _beneficiary
    ){
        beneficiary = _beneficiary;
    }

    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary); // Caugth beneficiary of the contract
        _;
    }
    mapping(address => uint256) pendingReturns; // Process votes
    event HighestVote(address player, uint256 amount); //With this function to catch the address and the amount of the vote


    //function that compare the value of the current vote and if is bigger than the last one, increase and change 
    //highest player and amount
    function vote() public payable{
        if (msg.value <= higestVote)
            revert("You must to enter more ETH TO WIN");
        if (highetsPlayer == msg.sender)
            revert("You are already highest voter in the game!!!");
        pendingReturns[highetsPlayer] += higestVote;
        highetsPlayer = msg.sender;
        higestVote = msg.value;
        emit HighestVote(msg.sender, msg.value);
    }

    ///function to return addresses and amount for the first player in the game!
    function getDetails()
        public
        view 
        returns (
            uint256 _higestVote,
            address _highetsPlayer,
            address _beneficiary
        )
        {
            return (
                higestVote,
                highetsPlayer,
                beneficiary
            );
        }
}