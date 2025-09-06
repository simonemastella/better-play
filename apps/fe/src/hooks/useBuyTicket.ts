import { useTransactionSimulation } from '@/hooks/useTransactionSimulation';
import { useTransactionContext } from '@/context/TransactionContext';
import { thorClient } from '@/lib/thor-client';
import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@vechain/vechain-kit';

interface BuyTicketParams {
	price: bigint;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
	bypassSimulation?: boolean;
}

interface BuyTicketState {
	insufficientBalance: boolean;
	requiredAmount: bigint;
	currentBalance: bigint;
}

// Contract addresses from the deployment
const LOTTERY_CONTRACT_ADDRESS = '0x0076a1bd78d32a03592a3aedfa03204786bad7bd';
const PAYMENT_TOKEN_ADDRESS = '0xbf64cf86894Ee0877C4e7d03936e35Ee8D8b864F';

// Lottery ABI from actual deployed contract
const LOTTERY_ABI = [
  {
    inputs: [],
    name: 'buyTicket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Simplified ERC20 ABI for token approval
const ERC20_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export function useBuyTicket() {
	const { account } = useWallet();
	const { transactionResult, clearTransactionResult } = useTransactionContext();
	const {
		simulateTransaction,
		isSimulating,
		simulationResult,
		error: simulationError,
		clearError: clearSimulationError,
	} = useTransactionSimulation();

	const [state, setState] = useState<BuyTicketState>({
		insufficientBalance: false,
		requiredAmount: BigInt(0),
		currentBalance: BigInt(0),
	});

	const [currentPurchaseParams, setCurrentPurchaseParams] = useState<BuyTicketParams | null>(null);
	const [isApprovalStep, setIsApprovalStep] = useState(false);
	const [isPurchaseStarted, setIsPurchaseStarted] = useState(false);
	const [transactionSent, setTransactionSent] = useState(false);

	// Use global transaction context
	const {
		sendTransaction,
		isTransactionPending,
		error: txError,
	} = useTransactionContext();
	
	// Reset purchase started when transaction pending changes to false
	useEffect(() => {
		if (!isTransactionPending && isPurchaseStarted) {
			// Small delay to ensure other states update first
			const timer = setTimeout(() => {
				setIsPurchaseStarted(false);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isTransactionPending, isPurchaseStarted]);

	// Helper function to check token balance
	const checkTokenBalance = useCallback(async (address: string): Promise<bigint> => {
		try {
			const tokenContract = thorClient.contracts.load(PAYMENT_TOKEN_ADDRESS, ERC20_ABI);
			const balanceResult = await tokenContract.read.balanceOf(address);
			return BigInt(balanceResult[0]);
		} catch (error) {
			console.error('💥 Token balance check failed with detailed error:');
			console.error('📋 Error object:', error);
			console.error('🔍 Error type:', typeof error);
			console.error('⚡ Error name:', error instanceof Error ? error.name : 'Unknown');
			console.error('📝 Error message:', error instanceof Error ? error.message : String(error));
			console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
			console.error('🔧 Balance check context:');
			console.error('👤 Address:', address);
			console.error('🏦 Token contract:', PAYMENT_TOKEN_ADDRESS);
			throw error;
		}
	}, []);

	// Helper function to check token allowance
	const checkTokenAllowance = useCallback(async (owner: string, spender: string): Promise<bigint> => {
		try {
			const tokenContract = thorClient.contracts.load(PAYMENT_TOKEN_ADDRESS, ERC20_ABI);
			const allowanceResult = await tokenContract.read.allowance(owner, spender);
			return BigInt(allowanceResult[0]);
		} catch (error) {
			console.error('💥 Token allowance check failed with detailed error:');
			console.error('📋 Error object:', error);
			console.error('🔍 Error type:', typeof error);
			console.error('⚡ Error name:', error instanceof Error ? error.name : 'Unknown');
			console.error('📝 Error message:', error instanceof Error ? error.message : String(error));
			console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
			console.error('🔧 Allowance check context:');
			console.error('👤 Owner:', owner);
			console.error('🎯 Spender:', spender);
			console.error('🏦 Token contract:', PAYMENT_TOKEN_ADDRESS);
			throw error;
		}
	}, []);

	const buyTicket = useCallback(
		async ({ price, onSuccess, onError, bypassSimulation = false }: BuyTicketParams) => {
			if (!account?.address) {
				const error = new Error('Wallet not connected');
				console.error('❌ Buy ticket failed:', error.message);
				onError?.(error);
				return;
			}

			// Set loading state immediately
			setIsPurchaseStarted(true);
			console.log('🎫 Starting ticket purchase process...');

			// Store current purchase params for potential retry
			setCurrentPurchaseParams({ price, onSuccess, onError, bypassSimulation });
			
			// Safety timeout to re-enable button if something goes wrong
			const timeoutId = setTimeout(() => {
				console.warn('⏰ Purchase timeout reached - resetting state');
				setIsPurchaseStarted(false);
			}, 30000); // 30 seconds timeout

			try {
				// Check balance
				console.log('💰 Checking token balance...');
				const balance = await checkTokenBalance(account.address);
				console.log(`💳 Current balance: ${balance.toString()} wei`);
				console.log(`💸 Required amount: ${price.toString()} wei`);

				if (balance < price) {
					console.warn('❌ Insufficient balance detected');
					setState({
						insufficientBalance: true,
						requiredAmount: price,
						currentBalance: balance,
					});
					setIsPurchaseStarted(false);
					clearTimeout(timeoutId);
					return;
				}

				// Check allowance
				console.log('🔍 Checking token allowance...');
				const currentAllowance = await checkTokenAllowance(account.address, LOTTERY_CONTRACT_ADDRESS);
				console.log(`✅ Current allowance: ${currentAllowance.toString()} wei`);

				// Build clauses using VeChain SDK
				const clauses = [];
				const tokenContract = thorClient.contracts.load(PAYMENT_TOKEN_ADDRESS, ERC20_ABI);

				if (currentAllowance < price) {
					setIsApprovalStep(true);
					console.log('📝 Adding approval clause...');

					const approvalClause = tokenContract.clause.approve(
						LOTTERY_CONTRACT_ADDRESS,
						price
					);
					clauses.push(approvalClause.clause);
					console.log('✅ Approval clause added');
				} else {
					setIsApprovalStep(false);
					console.log('⏭️  Skipping approval - sufficient allowance exists');
				}

				// Create purchase ticket clause
				console.log('🎰 Adding buyTicket clause...');
				const lotteryContract = thorClient.contracts.load(LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI);
				const buyTicketClause = lotteryContract.clause.buyTicket();
				
				// Debug logging for function selector
				console.log('🔍 DEBUG: Generated clause data:', buyTicketClause.clause.data);
				console.log('🔍 DEBUG: Expected function selector for buyTicket():', '0xb7150896');
				console.log('🔍 DEBUG: Actual function selector in clause:', buyTicketClause.clause.data?.slice(0, 10));
				
				clauses.push(buyTicketClause.clause);
				console.log('✅ BuyTicket clause added');

				console.log(`📦 Transaction summary: ${clauses.length} clause(s) prepared`);

				// Simulate transaction before sending (unless bypassed)
				if (!bypassSimulation) {
					console.log('🔄 Simulating transaction...');
					const simulation = await simulateTransaction(clauses);

					if (!simulation) {
						throw new Error('Transaction simulation failed');
					}

					if (!simulation.success) {
						console.error('❌ Simulation indicates transaction will fail');
						// Error will be handled by the popup through simulationError state
						setIsPurchaseStarted(false);
						clearTimeout(timeoutId);
						return;
					}
					
					console.log('✅ Simulation successful - proceeding with transaction');
				} else {
					console.warn('⚠️  Bypassing simulation as requested');
				}

				try {
					console.log('🚀 Sending transaction to blockchain...');
					await sendTransaction(clauses);
					console.log('📨 Transaction sent successfully');
					setTransactionSent(true);
					clearTimeout(timeoutId);
					onSuccess?.();
				} catch (txError) {
					// Transaction was cancelled or failed
					console.error('❌ Transaction sending failed with detailed error:');
					console.error('📋 Transaction error object:', txError);
					console.error('🔍 Transaction error type:', typeof txError);
					console.error('⚡ Transaction error name:', txError instanceof Error ? txError.name : 'Unknown');
					console.error('📝 Transaction error message:', txError instanceof Error ? txError.message : String(txError));
					console.error('📚 Transaction error stack:', txError instanceof Error ? txError.stack : 'No stack trace');
					
					// Log transaction context
					console.error('🔧 Transaction context that failed:');
					console.error('📋 Number of clauses:', clauses.length);
					console.error('📝 Clauses data:', JSON.stringify(clauses.map(c => ({
						to: c.to,
						value: c.value,
						data: c.data?.slice(0, 20) + '...' // Truncate data for readability
					})), null, 2));
					
					setIsPurchaseStarted(false);
					clearTimeout(timeoutId);
					throw txError; // Re-throw to be caught by outer catch
				}
			} catch (error) {
				console.error('💥 Purchase process failed with detailed error:');
				console.error('📋 Error object:', error);
				console.error('🔍 Error type:', typeof error);
				console.error('⚡ Error name:', error instanceof Error ? error.name : 'Unknown');
				console.error('📝 Error message:', error instanceof Error ? error.message : String(error));
				console.error('📚 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
				
				// Log purchase context for debugging
				console.error('🔧 Purchase context that failed:');
				console.error('💰 Price:', price.toString());
				console.error('👤 Account:', account?.address);
				console.error('⚙️  Bypass simulation:', bypassSimulation);
				console.error('🎯 Purchase started:', isPurchaseStarted);
				
				const err = error instanceof Error ? error : new Error('Purchase failed');
				setIsPurchaseStarted(false);
				clearTimeout(timeoutId);
				onError?.(err);
			}
		},
		[account, simulateTransaction, clearSimulationError, sendTransaction, checkTokenBalance, checkTokenAllowance]
	);

	const resetInsufficientBalance = useCallback(() => {
		setState((prev) => ({ ...prev, insufficientBalance: false }));
		console.log('🧹 Reset insufficient balance state');
	}, []);

	const retryWithBypass = useCallback(async () => {
		if (!currentPurchaseParams) {
			console.warn('⚠️  No purchase params available for retry');
			return;
		}

		console.log('🔄 Retrying purchase with simulation bypass...');
		// Clear the error first
		clearSimulationError();

		// Retry with bypass simulation
		await buyTicket({
			...currentPurchaseParams,
			bypassSimulation: true,
		});
	}, [currentPurchaseParams, clearSimulationError, buyTicket]);

	const closeTransactionResult = useCallback(() => {
		clearTransactionResult();
		setTransactionSent(false);
		console.log('🧹 Closed transaction result');
	}, [clearTransactionResult]);

	// Handle successful ticket purchase
	useEffect(() => {
		if (transactionResult && !transactionResult.reverted && transactionSent) {
			console.log('🎉 Ticket purchase completed successfully!');
			console.log('🆔 Transaction ID:', transactionResult.txId);
		}
	}, [transactionResult, transactionSent]);

	return {
		// Core actions
		buyTicket,
		retryWithBypass,
		resetInsufficientBalance,
		closeTransactionResult,

		// State flags
		isLoading: isPurchaseStarted,
		isApproving: isApprovalStep && isPurchaseStarted,
		isPurchasing: !isApprovalStep && isPurchaseStarted,
		isSimulating,
		isTransactionPending,
		transactionSent,

		// Error states
		simulationError,
		txError,
		insufficientBalance: state.insufficientBalance,

		// Data
		requiredAmount: state.requiredAmount,
		currentBalance: state.currentBalance,
		simulationResult,
		transactionResult,

		// Helpers
		clearSimulationError,
	};
}