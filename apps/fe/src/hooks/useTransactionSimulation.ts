import { simulateTransaction, estimateGas, type SimulationResult, type SimulationOptions } from '@/services/transaction-simulation';
import { useState, useCallback } from 'react';
import type { TransactionClause } from '@vechain/sdk-core';
import { useWallet } from '@vechain/vechain-kit';

interface UseTransactionSimulationReturn {
	simulateTransaction: (clauses: TransactionClause[]) => Promise<SimulationResult | null>;
	estimateGas: (clauses: TransactionClause[]) => Promise<number | null>;
	isSimulating: boolean;
	simulationResult: SimulationResult | null;
	error: string | null;
	clearResult: () => void;
	clearError: () => void;
}

export function useTransactionSimulation(): UseTransactionSimulationReturn {
	const { account } = useWallet();
	const [isSimulating, setIsSimulating] = useState(false);
	const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const simulate = useCallback(
		async (clauses: TransactionClause[]): Promise<SimulationResult | null> => {
			if (!account?.address) {
				const errorMsg = 'Wallet not connected';
				setError(errorMsg);
				console.error('❌ Simulation failed:', errorMsg);
				return null;
			}

			setIsSimulating(true);
			setError(null);

			try {
				console.log('🎯 Starting transaction simulation...');
				console.log('👤 Caller address:', account.address);
				console.log('📋 Number of clauses:', clauses.length);

				const options: SimulationOptions = {
					caller: account.address,
					gasPrice: '1000000000000000', // 1000 gwei - default VeChain gas price
				};

				const result = await simulateTransaction(clauses, options);
				setSimulationResult(result);

				if (!result.success) {
					const errorMsg = `Transaction will fail: ${result.vmError || 'Unknown error'}`;
					setError(errorMsg);
					console.error('❌ Simulation indicates transaction will fail:', result.vmError);
				} else {
					console.log('✅ Simulation successful - transaction should succeed');
				}

				return result;
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : 'Simulation failed';
				setError(errorMsg);
				console.error('💥 Simulation threw an error:', err);
				return null;
			} finally {
				setIsSimulating(false);
			}
		},
		[account?.address]
	);

	const estimate = useCallback(
		async (clauses: TransactionClause[]): Promise<number | null> => {
			if (!account?.address) {
				const errorMsg = 'Wallet not connected';
				setError(errorMsg);
				console.error('❌ Gas estimation failed:', errorMsg);
				return null;
			}

			setIsSimulating(true);
			setError(null);

			try {
				console.log('⛽ Starting gas estimation...');
				
				const options: SimulationOptions = {
					caller: account.address,
				};

				const gasEstimate = await estimateGas(clauses, options);
				console.log('✅ Gas estimation completed:', gasEstimate);
				return gasEstimate;
			} catch (err) {
				const errorMsg = err instanceof Error ? err.message : 'Gas estimation failed';
				setError(errorMsg);
				console.error('💥 Gas estimation threw an error:', err);
				return null;
			} finally {
				setIsSimulating(false);
			}
		},
		[account?.address]
	);

	const clearResult = useCallback(() => {
		setSimulationResult(null);
		setError(null);
		console.log('🧹 Cleared simulation result and error');
	}, []);

	const clearError = useCallback(() => {
		setError(null);
		console.log('🧹 Cleared simulation error');
	}, []);

	return {
		simulateTransaction: simulate,
		estimateGas: estimate,
		isSimulating,
		simulationResult,
		error,
		clearResult,
		clearError,
	};
}