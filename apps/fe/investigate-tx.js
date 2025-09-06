import { ThorClient, TESTNET_URL } from '@vechain/sdk-network';

// Create Thor client
const thorClient = ThorClient.at(TESTNET_URL);

async function investigateTransaction(txId) {
    console.log('🔍 Investigating transaction:', txId);
    console.log('=' .repeat(80));
    
    try {
        // Get transaction receipt
        console.log('📋 Fetching transaction receipt...');
        const receipt = await thorClient.transactions.getTransactionReceipt(txId);
        
        if (!receipt) {
            console.log('❌ Transaction not found!');
            return;
        }
        
        console.log('✅ Transaction receipt found');
        console.log('🔄 Reverted:', receipt.reverted);
        console.log('⛽ Gas used:', receipt.gasUsed);
        console.log('💰 Gas payer:', receipt.gasPayer);
        console.log('📦 Block number:', receipt.meta.blockNumber);
        console.log('🕒 Block timestamp:', new Date(receipt.meta.blockTimestamp * 1000).toISOString());
        
        // Analyze each output (clause result)
        console.log('\n📋 Clause Results:');
        receipt.outputs.forEach((output, index) => {
            console.log(`\n  Clause ${index + 1}:`);
            console.log(`    ✅ Success: ${!output.reverted}`);
            console.log(`    ⛽ Gas used: ${output.gasUsed}`);
            console.log(`    🎯 Contract deployed: ${output.contractAddress || 'N/A'}`);
            
            if (output.reverted) {
                console.log(`    ❌ REVERTED with data: ${output.data}`);
                // Try to decode revert reason
                try {
                    const revertReason = thorClient.transactions.decodeRevertReason(output.data);
                    console.log(`    📝 Revert reason: ${revertReason}`);
                } catch (e) {
                    console.log(`    📝 Raw revert data: ${output.data}`);
                }
            }
            
            // Show events
            if (output.events && output.events.length > 0) {
                console.log(`    🎉 Events emitted: ${output.events.length}`);
                output.events.forEach((event, eventIndex) => {
                    console.log(`      Event ${eventIndex + 1}: ${event.address}`);
                    console.log(`        Topics: ${event.topics.join(', ')}`);
                    console.log(`        Data: ${event.data}`);
                });
            } else {
                console.log(`    🎉 Events emitted: 0`);
            }
            
            // Show transfers
            if (output.transfers && output.transfers.length > 0) {
                console.log(`    💸 Transfers: ${output.transfers.length}`);
                output.transfers.forEach((transfer, transferIndex) => {
                    console.log(`      Transfer ${transferIndex + 1}: ${transfer.sender} → ${transfer.recipient}`);
                    console.log(`        Amount: ${transfer.amount} wei`);
                });
            } else {
                console.log(`    💸 Transfers: 0`);
            }
        });
        
        // Get the original transaction
        console.log('\n📨 Fetching original transaction...');
        const transaction = await thorClient.transactions.getTransaction(txId);
        
        if (transaction) {
            console.log('📋 Transaction details:');
            console.log('👤 Origin:', transaction.origin);
            console.log('💰 Gas:', transaction.gas);
            console.log('⛽ Gas coefficient:', transaction.gasCoef);
            console.log('🔗 Chain tag:', transaction.chainTag);
            console.log('📦 Clauses:', transaction.clauses.length);
            
            transaction.clauses.forEach((clause, index) => {
                console.log(`\n  Clause ${index + 1}:`);
                console.log(`    🎯 To: ${clause.to}`);
                console.log(`    💰 Value: ${clause.value} wei`);
                console.log(`    📝 Data: ${clause.data.substring(0, 100)}${clause.data.length > 100 ? '...' : ''}`);
                
                // Try to decode function call if it looks like one
                if (clause.data && clause.data.startsWith('0x') && clause.data.length >= 10) {
                    const functionSelector = clause.data.substring(0, 10);
                    console.log(`    🔧 Function selector: ${functionSelector}`);
                    
                    // Common function selectors
                    const knownSelectors = {
                        '0xa9059cbb': 'transfer(address,uint256)',
                        '0x095ea7b3': 'approve(address,uint256)',
                        '0x23b872dd': 'transferFrom(address,address,uint256)',
                        '0x70a08231': 'balanceOf(address)',
                        '0xdd62ed3e': 'allowance(address,address)',
                        '0x4c6ac8e8': 'buyTicket()',
                    };
                    
                    if (knownSelectors[functionSelector]) {
                        console.log(`    📋 Function: ${knownSelectors[functionSelector]}`);
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('💥 Error investigating transaction:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}

// Run the investigation
const txId = '0xcc53d56f03b6a12199f35ee1f1f668f10f0304d5a0b8e1b3601585471ff0fd04';
investigateTransaction(txId).catch(console.error);