// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IXAllocationVoting.sol";

contract Lottery is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant TREASURER_ROLE = keccak256("TREASURER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct RoundDetails {
        uint256 ticketPrice; //price in wei (1e18)
        uint256[] prizes; // sum of this must be 10_000; if the array is [5_000, 3_000, 2_000] the first will win 50%, the second 30% and the third 20%
    }
    struct RoundStats {
        uint256 nextTicketId; // the number of the next ticket; starts at 0, after first buy will be 1
        uint256 endBlock; // is fetched the first time
        uint256 collectedAmount; // sum of amount paid to get tickets
    }
    // Structs for round results
    struct RoundResult {
        address[] winners;
        uint256[] prizesWon;
    }

    RoundDetails public nextRoundDetails;
    mapping(uint256 roundId => RoundDetails details) public roundDetails;
    mapping(uint256 roundId => RoundStats stats) public roundStats;
    mapping(uint256 roundId => mapping(uint256 ticketNumber => address ticketOwner))
        public ticketOwner;

    IXAllocationVoting public immutable xAllocationVoting;
    IERC20 public immutable paymentToken;

    mapping(uint256 roundId => RoundResult result) public roundResults;

    // Events
    event TicketPurchased(
        uint256 indexed ticketId,
        address indexed buyer,
        uint256 indexed roundId,
        uint256 price
    );
    event NextRoundDetailsUpdated(
        uint256 oldPrice,
        uint256 newPrice,
        uint256[] newPrizes
    );
    event RoundRevealed(
        uint256 indexed roundId,
        address[] winners,
        uint256[] prizes,
        uint256 totalPrize
    );
    event PrizeClaimed(
        uint256 indexed roundId,
        address indexed winner,
        uint256 amount
    );

    constructor(
        address _xAllocationVoting,
        address _paymentToken,
        uint256 _initialTicketPrice,
        uint256[] memory _initialPrizes
    ) {
        require(
            _xAllocationVoting != address(0),
            "Invalid XAllocation address"
        );
        require(_paymentToken != address(0), "Invalid payment token address");
        require(_initialTicketPrice > 0, "Ticket price must be greater than 0");
        require(_initialPrizes.length > 0, "Prizes array cannot be empty");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _initialPrizes.length; i++) {
            totalPercentage += _initialPrizes[i];
        }
        require(totalPercentage == 10_000, "Prizes must sum to 10000 (100%)");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(TREASURER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        xAllocationVoting = IXAllocationVoting(_xAllocationVoting);
        paymentToken = IERC20(_paymentToken);

        nextRoundDetails = RoundDetails({
            ticketPrice: _initialTicketPrice,
            prizes: _initialPrizes
        });
    }

    function buyTicket() external nonReentrant whenNotPaused {
        uint256 roundId = xAllocationVoting.currentRoundId();
        if (roundStats[roundId].endBlock == 0) _setupRound(roundId);
        require(
            roundStats[roundId].endBlock > block.number + 6,
            "Round ends too soon"
        );
        uint256 ticketPrice = roundDetails[roundId].ticketPrice;
        require(
            paymentToken.transferFrom(msg.sender, address(this), ticketPrice),
            "Token transfer failed"
        );

        uint256 ticketId = roundStats[roundId].nextTicketId++;
        roundStats[roundId].collectedAmount += ticketPrice;
        ticketOwner[roundId][ticketId] = msg.sender;

        emit TicketPurchased(ticketId, msg.sender, roundId, ticketPrice);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function setNextRoundDetails(
        uint256 _newPrice,
        uint256[] memory _newPrizes
    ) external onlyRole(ADMIN_ROLE) {
        require(_newPrice > 0, "Price must be greater than 0");
        require(_newPrizes.length > 0, "Prizes array cannot be empty");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _newPrizes.length; i++) {
            totalPercentage += _newPrizes[i];
        }
        require(totalPercentage == 10_000, "Prizes must sum to 10000 (100%)");

        uint256 oldPrice = nextRoundDetails.ticketPrice;
        nextRoundDetails.ticketPrice = _newPrice;
        nextRoundDetails.prizes = _newPrizes;

        emit NextRoundDetailsUpdated(oldPrice, _newPrice, _newPrizes);
    }

    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyRole(TREASURER_ROLE) {
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Amount must be greater than 0");
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }

    function revealRound(uint256 _veBetterRoundId) external nonReentrant {
        _validateRound(_veBetterRoundId);

        uint256 totalTickets = roundStats[_veBetterRoundId].nextTicketId;
        uint256 totalPrize = roundStats[_veBetterRoundId].collectedAmount;
        bytes32 blockHash = _getRandomness(_veBetterRoundId);

        (
            address[] memory winners,
            uint256[] memory prizesWon
        ) = _selectWinnersAndCalculatePrizes(
                _veBetterRoundId,
                totalTickets,
                totalPrize,
                blockHash
            );

        roundResults[_veBetterRoundId] = RoundResult({
            winners: winners,
            prizesWon: prizesWon
        });
        _distributePrizes(_veBetterRoundId, winners, prizesWon);

        emit RoundRevealed(_veBetterRoundId, winners, prizesWon, totalPrize);
    }

    function _validateRound(uint256 roundId) internal view {
        require(xAllocationVoting.hasEnded(roundId), "Round not ended yet");
        require(
            roundResults[roundId].winners.length == 0,
            "Round already revealed"
        );
        require(
            roundStats[roundId].nextTicketId > 0,
            "No tickets sold for this round"
        );
    }

    function _getRandomness(uint256 roundId) internal view returns (bytes32) {
        bytes32 blockHash = blockhash(roundStats[roundId].endBlock);
        require(blockHash != bytes32(0), "Block hash unavailable (too old)");
        return blockHash;
    }

    function _selectWinnersAndCalculatePrizes(
        uint256 roundId,
        uint256 totalTickets,
        uint256 totalPrize,
        bytes32 blockHash
    ) internal view returns (address[] memory, uint256[] memory) {
        uint256[] storage prizes = roundDetails[roundId].prizes;
        uint256 winnersCount = prizes.length > totalTickets
            ? totalTickets
            : prizes.length;

        address[] memory winners = new address[](winnersCount);
        uint256[] memory prizesWon = new uint256[](winnersCount);

        for (uint256 i = 0; i < winnersCount; i++) {
            uint256 ticketId = uint256(
                keccak256(abi.encodePacked(blockHash, roundId, i))
            ) % totalTickets;
            winners[i] = ticketOwner[roundId][ticketId];
            prizesWon[i] = (totalPrize * prizes[i]) / 10_000;
        }

        for (uint256 i = winnersCount; i < prizes.length; i++) {
            prizesWon[0] += (totalPrize * prizes[i]) / 10_000;
        }

        return (winners, prizesWon);
    }

    function _setupRound(uint256 roundId) internal {
        require(xAllocationVoting.hasStarted(roundId), "Round not started");
        roundStats[roundId].endBlock = xAllocationVoting.roundDeadline(roundId);
        roundDetails[roundId] = nextRoundDetails;
    }

    function _distributePrizes(
        uint256 roundId,
        address[] memory winners,
        uint256[] memory prizesWon
    ) internal {
        for (uint256 i = 0; i < winners.length; i++) {
            if (prizesWon[i] > 0) {
                require(
                    paymentToken.transfer(winners[i], prizesWon[i]),
                    "Prize transfer failed"
                );
                emit PrizeClaimed(roundId, winners[i], prizesWon[i]);
            }
        }
    }
}
