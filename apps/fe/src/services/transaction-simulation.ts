import { thorClient } from '../lib/thor-client';
import type { TransactionClause } from '@vechain/sdk-core';

export interface SimulationResult {
	success: boolean;
	gasUsed: number;
	vmError?: string;
	events: any[];
	transfers: any[];
	estimatedGasCost: bigint;
}

export interface SimulationOptions {
	caller: string;
	gasPayer?: string;
	gasPrice?: string;
	gasLimit?: number;
}

/**
 * Simulates a transaction before sending it to the blockchain
 * This helps identify potential failures and estimate gas costs
 */
export async function simulateTransaction(
	clauses: TransactionClause[],
	options: SimulationOptions
): Promise<SimulationResult> {
	try {
		const simulationOptions = {
			caller: options.caller,
			gasPayer: options.gasPayer,
			gasPrice: options.gasPrice,
			gas: options.gasLimit,
		};

		// Convert TransactionClause objects to simulation format
		const simulationClauses = clauses.map(clause => ({
			to: clause.to,
			value: clause.value || '0x0',
			data: clause.data || '0x',
		}));

		console.log('🔄 Starting transaction simulation...');
		console.log('📋 Simulation clauses:', JSON.stringify(simulationClauses, null, 2));
		console.log('⚙️  Simulation options:', simulationOptions);

		const simulationResults = await thorClient.transactions.simulateTransaction(
			simulationClauses,
			simulationOptions
		);

		console.log('✅ Simulation results received:', simulationResults);

		// Calculate total gas used across all clauses
		const totalGasUsed = simulationResults.reduce((total, result) => {
			return total + result.gasUsed;
		}, 0);

		// Check if any clause reverted
		const hasRevertedClauses = simulationResults.some(result => result.reverted);
		const revertError = simulationResults.find(result => result.reverted)?.vmError;

		// Estimate gas cost (gas used * gas price)
		const gasPrice = BigInt(options.gasPrice || '1000000000000000'); // Default 1000 gwei
		const estimatedGasCost = BigInt(totalGasUsed) * gasPrice;

		// Collect all events and transfers
		const allEvents = simulationResults.flatMap(result => result.events);
		const allTransfers = simulationResults.flatMap(result => result.transfers);

		const result = {
			success: !hasRevertedClauses,
			gasUsed: totalGasUsed,
			vmError: revertError,
			events: allEvents,
			transfers: allTransfers,
			estimatedGasCost,
		};

		if (result.success) {
			console.log('✅ Transaction simulation successful!');
			console.log('⛽ Gas used:', result.gasUsed);
			console.log('💰 Estimated cost:', result.estimatedGasCost.toString(), 'wei');
		} else {
			console.error('❌ Transaction simulation failed!');
			console.error('🔍 VM Error:', result.vmError);
		}

		return result;
	} catch (error) {
		console.error('💥 Transaction simulation failed with detailed error:');
		console.error('📋 Error object:', error);
		console.error('🔍 Error type:', typeof error);
		console.error('⚡ Error name:', error instanceof Error ? error.name : 'Unknown');
		console.error('📝 Error message:', error instanceof Error ? error.message : String(error));
		console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
		
		// Log simulation inputs for debugging
		console.error('🔧 Simulation inputs that failed:');
		console.error('📋 Clauses:', JSON.stringify(clauses, null, 2));
		console.error('⚙️  Options:', JSON.stringify(options, null, 2));
		console.error('🌐 ThorClient status:', thorClient ? 'Available' : 'Unavailable');
		
		// Additional error context
		if (error instanceof Error) {
			if (error.message.includes('network') || error.message.includes('fetch')) {
				console.error('🌐 Network error detected - check VeChain node connectivity');
			}
			if (error.message.includes('insufficient') || error.message.includes('balance')) {
				console.error('💰 Balance related error detected');
			}
			if (error.message.includes('revert') || error.message.includes('execution')) {
				console.error('🔄 Transaction execution error detected');
			}
		}
		
		throw new Error(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Estimates gas for a transaction
 */
export async function estimateGas(
	clauses: TransactionClause[],
	options: SimulationOptions
): Promise<number> {
	try {
		const simulationClauses = clauses.map(clause => ({
			to: clause.to,
			value: clause.value || '0x0',
			data: clause.data || '0x',
		}));

		console.log('⛽ Estimating gas for transaction...');

		const gasEstimate = await thorClient.transactions.estimateGas(
			simulationClauses,
			options.caller
		);

		console.log('✅ Gas estimation completed:', gasEstimate.totalGas);
		return gasEstimate.totalGas;
	} catch (error) {
		console.error('💥 Gas estimation failed with detailed error:');
		console.error('📋 Error object:', error);
		console.error('🔍 Error type:', typeof error);
		console.error('⚡ Error name:', error instanceof Error ? error.name : 'Unknown');
		console.error('📝 Error message:', error instanceof Error ? error.message : String(error));
		console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
		
		// Log gas estimation inputs for debugging
		console.error('🔧 Gas estimation inputs that failed:');
		console.error('📋 Clauses:', JSON.stringify(clauses, null, 2));
		console.error('👤 Caller:', options.caller);
		console.error('🌐 ThorClient status:', thorClient ? 'Available' : 'Unavailable');
		
		throw new Error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Decodes revert reason from failed transaction
 */
export function decodeRevertReason(data: string): string {
	try {
		return thorClient.transactions.decodeRevertReason(data);
	} catch (error) {
		console.warn('⚠️  Could not decode revert reason:', error);
		return 'Unknown revert reason';
	}
}