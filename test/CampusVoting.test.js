const { expect } = require("chai");
const { ethers } = require("hardhat");

describe ("CampusVoting" , function(){
    let voting ;
    let admin ;
    let user1 ;
    let user2 ;

    beforeEach(async function () {      //this stuff runs before every test
        const accounts = await ethers.getSigners();
        admin = accounts[0];
        user1 = accounts[1];
        user2 = accounts[2] ;

        const CampusVoting = await ethers.getContractFactory("CampusVoting") ;
        voting = await CampusVoting.deploy();
        await voting.waitForDeployment();
    });

    it("Should set admin correctly" , async function(){
        expect(await voting.admin()).to.equal(admin.address);
    });

    it ("Should start election only if admin " , async function(){
        const now = (await ethers.provider.getBlock("latest")).timestamp ;
        await voting.startNewElection(now+10 , now + 100);
        expect (await voting.currentElectionId()).to.equal(1);
    });

    it("Should prevent non-admin from starting election" , async function(){
        const now = (await ethers.provider.getBlock("latest")).timestamp ;

        await expect(
            voting.connect(user1).startNewElection(now+10 , now + 100 )
        ).to.be.revertedWith("Not admin");
    });

    it ("Should Allow users to vote" , async function(){
        const now = (await ethers.provider.getBlock("latest")).timestamp ;
        await voting.startNewElection(now + 5 , now + 100);
        await voting.addPost("President" , 2) ;
        await ethers.provider.send("evm_increaseTime" , [10]);
        await ethers.provider.send("evm_mine");
        const voterHash = ethers.keccak256(ethers.toUtf8Bytes("student1-election1"));
        await voting.vote(voterHash, [0]);
        await ethers.provider.send("evm_increaseTime", [200]);
        await ethers.provider.send("evm_mine");
        const votes = await voting.getVotes(1 , 0 , 0);
        expect(votes).to.equal(1);
    });
})