import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useWallet, useSendTransaction } from '@vechain/vechain-kit';

interface TransactionResult {
	txId: string;
	reverted: boolean;
	tokenId?: string;
}

interface TransactionContextType {
	transactionResult: TransactionResult | null;
	setTransactionResult: (result: TransactionResult | null) => void;
	clearTransactionResult: () => void;
	sendTransaction: (clauses: any[]) => Promise<void>;
	isTransactionPending: boolean;
	error: any;
	lastTransactionCancelled: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
	const { account } = useWallet();
	const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
	const [lastTransactionCancelled, setLastTransactionCancelled] = useState(false);
	const loggedTxIds = useRef<Set<string>>(new Set());

	const {
		sendTransaction,
		isTransactionPending,
		error: txError,
		txReceipt,
	} = useSendTransaction({
		signerAccountAddress: account?.address || '',
		onTxConfirmed: () => {
			console.log('Global transaction confirmed');
		},
		onTxFailedOrCancelled: () => {
			console.log('Global transaction failed or cancelled');
			setLastTransactionCancelled(true);
		},
	});

	// Monitor transaction receipt for popup
	useEffect(() => {
		console.log('Global useEffect triggered, txReceipt:', txReceipt);
		if (txReceipt?.meta?.txID && !loggedTxIds.current.has(txReceipt.meta.txID)) {
			console.log('Transaction sent with ID:', txReceipt.meta.txID);
			console.log('Reverted:', txReceipt.reverted);
			console.log('Full txReceipt:', txReceipt);
			loggedTxIds.current.add(txReceipt.meta.txID);
			
			// Show popup with transaction result
			const result = {
				txId: txReceipt.meta.txID,
				reverted: txReceipt.reverted,
			};
			
			console.log('Setting transactionResult:', result);
			setTransactionResult(result);
		}
	}, [txReceipt]);

	const clearTransactionResult = useCallback(() => {
		setTransactionResult(null);
	}, []);

	// Clear cancellation flag when a new transaction starts
	useEffect(() => {
		if (isTransactionPending) {
			setLastTransactionCancelled(false);
		}
	}, [isTransactionPending]);

	return (
		<TransactionContext.Provider value={{
			transactionResult,
			setTransactionResult,
			clearTransactionResult,
			sendTransaction,
			isTransactionPending,
			error: txError,
			lastTransactionCancelled,
		}}>
			{children}
		</TransactionContext.Provider>
	);
}

export function useTransactionContext() {
	const context = useContext(TransactionContext);
	if (context === undefined) {
		throw new Error('useTransactionContext must be used within a TransactionProvider');
	}
	return context;
}