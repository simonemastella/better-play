// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IXAllocationVoting {
    function currentRoundId() external view returns (uint256);
    
    function currentRoundDeadline() external view returns (uint256);
    
    function roundDeadline(uint256 roundId) external view returns (uint256);
    
    function roundSnapshot(uint256 roundId) external view returns (uint256);
    
    function hasStarted(uint256 roundId) external view returns (bool);
    
    function hasEnded(uint256 roundId) external view returns (bool);
    
    function votingEnabled() external view returns (bool);
    
    function roundDuration() external view returns (uint256);
}