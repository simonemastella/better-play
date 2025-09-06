import { keccak256, hexToBytes } from '@vechain/sdk-core';

// Calculate function selectors
function calculateSelector(functionSignature) {
    const hash = keccak256(hexToBytes('0x' + Buffer.from(functionSignature).toString('hex')));
    return '0x' + hash.toString('hex').slice(0, 8);
}

console.log('🔍 Function selector analysis:');
console.log('=' .repeat(50));
console.log('buyTicket():', calculateSelector('buyTicket()'));
console.log('increaseVolume(uint256):', calculateSelector('increaseVolume(uint256)'));

console.log('');
console.log('❌ Transaction used: 0xedca914c');
console.log('✅ Contract expects: ' + calculateSelector('buyTicket()'));
console.log('');
console.log('🔧 The issue: Your useBuyTicket hook is calling the wrong function!');