import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Lottery } from "../typechain-types";

describe("Lottery", function () {
  let lottery: Lottery;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;
  let player3: SignerWithAddress;

  const TICKET_PRICE = ethers.parseEther("0.01");
  const DRAW_INTERVAL = 7 * 24 * 60 * 60; // 7 days

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    const LotteryFactory = await ethers.getContractFactory("Lottery");
    lottery = await LotteryFactory.deploy();
    await lottery.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin roles", async function () {
      const DEFAULT_ADMIN_ROLE = await lottery.DEFAULT_ADMIN_ROLE();
      const ADMIN_ROLE = await lottery.ADMIN_ROLE();
      const OPERATOR_ROLE = await lottery.OPERATOR_ROLE();
      const TREASURER_ROLE = await lottery.TREASURER_ROLE();
      const PAUSER_ROLE = await lottery.PAUSER_ROLE();

      expect(await lottery.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await lottery.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await lottery.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
      expect(await lottery.hasRole(TREASURER_ROLE, owner.address)).to.be.true;
      expect(await lottery.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });

    it("Should start first round automatically", async function () {
      expect(await lottery.currentRoundId()).to.equal(1);
      
      const roundInfo = await lottery.getCurrentRoundInfo();
      expect(roundInfo.roundId).to.equal(1);
      expect(roundInfo.isActive).to.be.true;
    });

    it("Should have correct constants", async function () {
      expect(await lottery.TICKET_PRICE()).to.equal(TICKET_PRICE);
      expect(await lottery.MAX_TICKETS_PER_USER()).to.equal(100);
      expect(await lottery.DRAW_INTERVAL()).to.equal(DRAW_INTERVAL);
      expect(await lottery.FEE_PERCENTAGE()).to.equal(5);
    });
  });

  describe("Buying Tickets", function () {
    it("Should allow buying single ticket", async function () {
      await expect(
        lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE })
      )
        .to.emit(lottery, "TicketPurchased")
        .withArgs(1, player1.address, 1, TICKET_PRICE);

      expect(await lottery.getUserTickets(1, player1.address)).to.equal(1);
    });

    it("Should allow buying multiple tickets", async function () {
      const ticketCount = 5;
      const totalCost = TICKET_PRICE * BigInt(ticketCount);

      await lottery.connect(player1).buyTickets(ticketCount, { value: totalCost });

      expect(await lottery.getUserTickets(1, player1.address)).to.equal(ticketCount);
    });

    it("Should reject incorrect payment", async function () {
      await expect(
        lottery.connect(player1).buyTickets(2, { value: TICKET_PRICE })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should reject buying 0 tickets", async function () {
      await expect(
        lottery.connect(player1).buyTickets(0, { value: 0 })
      ).to.be.revertedWith("Must buy at least one ticket");
    });

    it("Should enforce max tickets per user", async function () {
      const maxTickets = await lottery.MAX_TICKETS_PER_USER();
      const totalCost = TICKET_PRICE * maxTickets;

      await lottery.connect(player1).buyTickets(maxTickets, { value: totalCost });

      await expect(
        lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE })
      ).to.be.revertedWith("Exceeds max tickets per user");
    });

    it("Should update prize pool correctly", async function () {
      const ticketCount = 3;
      const totalCost = TICKET_PRICE * BigInt(ticketCount);

      await lottery.connect(player1).buyTickets(ticketCount, { value: totalCost });
      await lottery.connect(player2).buyTickets(2, { value: TICKET_PRICE * 2n });

      const roundInfo = await lottery.getCurrentRoundInfo();
      expect(roundInfo.prizePool).to.equal(TICKET_PRICE * 5n);
    });

    it("Should not allow buying after round ends", async function () {
      await time.increase(DRAW_INTERVAL + 1);

      await expect(
        lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE })
      ).to.be.revertedWith("Round has ended");
    });
  });

  describe("Drawing Winner", function () {
    beforeEach(async function () {
      // Players buy tickets
      await lottery.connect(player1).buyTickets(3, { value: TICKET_PRICE * 3n });
      await lottery.connect(player2).buyTickets(2, { value: TICKET_PRICE * 2n });
      await lottery.connect(player3).buyTickets(1, { value: TICKET_PRICE });
    });

    it("Should not allow drawing before round ends", async function () {
      await expect(lottery.drawWinner()).to.be.revertedWith("Round not ended yet");
    });

    it("Should draw winner after round ends", async function () {
      await time.increase(DRAW_INTERVAL + 1);

      await expect(lottery.drawWinner())
        .to.emit(lottery, "WinnerSelected");

      const round = await lottery.rounds(1);
      expect(round.drawn).to.be.true;
      expect(round.winner).to.not.equal(ethers.ZeroAddress);
    });

    it("Should start new round after drawing", async function () {
      await time.increase(DRAW_INTERVAL + 1);
      await lottery.drawWinner();

      expect(await lottery.currentRoundId()).to.equal(2);
      
      const newRoundInfo = await lottery.getCurrentRoundInfo();
      expect(newRoundInfo.roundId).to.equal(2);
      expect(newRoundInfo.isActive).to.be.true;
    });

    it("Should not allow drawing twice", async function () {
      await time.increase(DRAW_INTERVAL + 1);
      await lottery.drawWinner();

      await expect(lottery.drawWinner()).to.be.revertedWith("Winner already drawn");
    });

    it("Should calculate fees correctly", async function () {
      const totalPool = TICKET_PRICE * 6n;
      const expectedFee = totalPool * 5n / 100n;
      const expectedPrize = totalPool - expectedFee;

      await time.increase(DRAW_INTERVAL + 1);
      await lottery.drawWinner();

      const round = await lottery.rounds(1);
      expect(round.platformFee).to.equal(expectedFee);
      expect(round.winnerPrize).to.equal(expectedPrize);
    });
  });

  describe("Claiming Prize", function () {
    beforeEach(async function () {
      await lottery.connect(player1).buyTickets(10, { value: TICKET_PRICE * 10n });
      await lottery.connect(player2).buyTickets(5, { value: TICKET_PRICE * 5n });
      await time.increase(DRAW_INTERVAL + 1);
    });

    it("Should allow winner to claim prize", async function () {
      await lottery.drawWinner();
      
      const round = await lottery.rounds(1);
      const winner = round.winner;
      const prize = round.winnerPrize;

      const winnerSigner = [owner, player1, player2].find(
        s => s.address === winner
      );

      if (winnerSigner && winnerSigner.address !== owner.address) {
        const balanceBefore = await ethers.provider.getBalance(winner);
        
        await expect(lottery.connect(winnerSigner).claimPrize(1))
          .to.emit(lottery, "PrizeClaimed")
          .withArgs(1, winner, prize);

        const balanceAfter = await ethers.provider.getBalance(winner);
        expect(balanceAfter - balanceBefore).to.be.closeTo(prize, ethers.parseEther("0.001"));
      }
    });

    it("Should not allow non-winner to claim", async function () {
      await lottery.drawWinner();
      
      const round = await lottery.rounds(1);
      const winner = round.winner;

      const nonWinner = winner === player1.address ? player2 : player1;

      await expect(
        lottery.connect(nonWinner).claimPrize(1)
      ).to.be.revertedWith("Not the winner");
    });

    it("Should not allow claiming twice", async function () {
      await lottery.drawWinner();
      
      const round = await lottery.rounds(1);
      const winner = round.winner;

      const winnerSigner = [owner, player1, player2].find(
        s => s.address === winner
      );

      if (winnerSigner && winnerSigner.address !== owner.address) {
        await lottery.connect(winnerSigner).claimPrize(1);

        await expect(
          lottery.connect(winnerSigner).claimPrize(1)
        ).to.be.revertedWith("Prize already claimed");
      }
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause/unpause", async function () {
      await lottery.pause();
      
      await expect(
        lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE })
      ).to.be.revertedWith("Pausable: paused");

      await lottery.unpause();

      await expect(
        lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE })
      ).to.not.be.reverted;
    });

    it("Should allow owner to withdraw fees", async function () {
      await lottery.connect(player1).buyTickets(10, { value: TICKET_PRICE * 10n });
      await time.increase(DRAW_INTERVAL + 1);
      await lottery.drawWinner();

      const round = await lottery.rounds(1);
      const expectedFees = round.platformFee;

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      
      const tx = await lottery.withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(expectedFees);
    });

    it("Should not allow non-pauser to pause", async function () {
      const PAUSER_ROLE = await lottery.PAUSER_ROLE();
      await expect(
        lottery.connect(player1).pause()
      ).to.be.revertedWith(`AccessControl: account ${player1.address.toLowerCase()} is missing role ${PAUSER_ROLE}`);
    });

    it("Should allow granting roles", async function () {
      const OPERATOR_ROLE = await lottery.OPERATOR_ROLE();
      
      // Grant operator role to player1
      await lottery.grantRole(OPERATOR_ROLE, player1.address);
      expect(await lottery.hasRole(OPERATOR_ROLE, player1.address)).to.be.true;

      // Now player1 can draw winner
      await lottery.connect(player2).buyTickets(1, { value: TICKET_PRICE });
      await time.increase(DRAW_INTERVAL + 1);
      
      await expect(lottery.connect(player1).drawWinner()).to.not.be.reverted;
    });

    it("Should enforce role-based access", async function () {
      // Non-operator cannot draw winner
      await lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE });
      await time.increase(DRAW_INTERVAL + 1);
      
      const OPERATOR_ROLE = await lottery.OPERATOR_ROLE();
      await expect(
        lottery.connect(player1).drawWinner()
      ).to.be.revertedWith(`AccessControl: account ${player1.address.toLowerCase()} is missing role ${OPERATOR_ROLE}`);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle round with no participants", async function () {
      await time.increase(DRAW_INTERVAL + 1);

      await expect(lottery.drawWinner()).to.be.revertedWith("No participants");
    });

    it("Should allow owner to cancel empty round", async function () {
      await expect(lottery.cancelRound())
        .to.emit(lottery, "RoundCancelled")
        .withArgs(1);

      expect(await lottery.currentRoundId()).to.equal(2);
    });

    it("Should not allow cancelling round with participants", async function () {
      await lottery.connect(player1).buyTickets(1, { value: TICKET_PRICE });

      await expect(lottery.cancelRound()).to.be.revertedWith("Round has participants");
    });
  });
});