import crypto from 'crypto';

// Function to calculate keccak256
function keccak256(input) {
    return crypto.createHash('sha3-256').update(input).digest('hex');
}

// Calculate function selectors
function calculateSelector(functionSignature) {
    const hash = keccak256(functionSignature);
    return '0x' + hash.slice(0, 8);
}

console.log('🔍 Function selector analysis:');
console.log('=' .repeat(50));
console.log('buyTicket():', calculateSelector('buyTicket()'));
console.log('increaseVolume(uint256):', calculateSelector('increaseVolume(uint256)'));

console.log('');
console.log('❌ Transaction used: 0xedca914c');
console.log('✅ Expected for buyTicket():', calculateSelector('buyTicket()'));

// Try to find what 0xedca914c corresponds to
const targetSelector = 'edca914c';
const possibleFunctions = [
    'increaseVolume(uint256)',
    'setAmount(uint256)', 
    'deposit(uint256)',
    'mint(uint256)',
    'burn(uint256)'
];

console.log('\n🔍 Checking what 0xedca914c might be:');
for (const func of possibleFunctions) {
    const selector = calculateSelector(func);
    if (selector === '0x' + targetSelector) {
        console.log('✅ Found match:', func, '=', selector);
    } else {
        console.log('  ', func, '=', selector);
    }
}
