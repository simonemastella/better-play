import { useWallet } from '@vechain/vechain-kit';
import { Button, VStack, Text, useToast, Spinner, Box } from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { useBuyTicket } from '../hooks/useBuyTicket';
import { SimulationErrorDialog } from './SimulationErrorDialog';
import { InsufficientBalanceDialog } from './InsufficientBalanceDialog';

export function BuyTicket() {
  const { account, connection } = useWallet();
  const toast = useToast();
  const ticketPrice = BigInt('1000000000000000000'); // 1 token with 18 decimals

  // Use the new enterprise-grade buy ticket hook
  const {
    buyTicket,
    retryWithBypass,
    resetInsufficientBalance,
    isLoading,
    isApproving,
    isPurchasing,
    isSimulating,
    isTransactionPending,
    transactionSent,
    simulationError,
    txError,
    insufficientBalance,
    requiredAmount,
    currentBalance,
    simulationResult,
    transactionResult,
    clearSimulationError,
  } = useBuyTicket();

  const handleBuyTicket = useCallback(async () => {
    if (!account?.address) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    await buyTicket({
      price: ticketPrice,
      onSuccess: () => {
        console.log('🎉 Ticket purchase initiated successfully');
      },
      onError: (error) => {
        console.error('❌ Ticket purchase failed:', error);
      },
    });
  }, [account?.address, buyTicket, toast, ticketPrice]);

  // Handle transaction result success/failure notifications
  useEffect(() => {
    if (transactionResult && !transactionResult.reverted) {
      toast({
        title: 'Ticket purchased!',
        description: `Transaction successful: ${transactionResult.txId.slice(0, 10)}...`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else if (transactionResult?.reverted) {
      toast({
        title: 'Transaction failed',
        description: 'The transaction was reverted',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [transactionResult, toast]);

  // Show loading animation when transaction is sent
  if (transactionSent) {
    return (
      <VStack spacing={4} p={4} borderWidth={1} borderRadius="md" bg="blue.50">
        <Text fontSize="lg" fontWeight="bold" color="blue.600">Processing Transaction</Text>
        <Spinner size="xl" color="blue.500" />
        <Text fontSize="sm" color="blue.600" textAlign="center">
          Your ticket purchase is being processed on the blockchain...
        </Text>
      </VStack>
    );
  }

  if (!connection.isConnected || !account?.address) {
    return (
      <VStack spacing={4} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
        <Text fontSize="lg" fontWeight="bold">Buy Lottery Ticket</Text>
        <Text fontSize="sm" color="gray.600">
          Please connect your wallet to buy tickets
        </Text>
      </VStack>
    );
  }

  const getButtonText = () => {
    if (isSimulating) return "Simulating...";
    if (isApproving) return "Approving Token...";
    if (isPurchasing) return "Purchasing Ticket...";
    return "Buy Ticket";
  };

  const getButtonColor = () => {
    if (simulationError) return "red";
    if (isSimulating) return "blue";
    if (isApproving) return "yellow";
    return "green";
  };

  return (
    <>
      <VStack spacing={4} p={4} borderWidth={1} borderRadius="md">
        <Text fontSize="lg" fontWeight="bold">Buy Lottery Ticket</Text>
        
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.600">
            Ticket Price: 1 B3TR Token
          </Text>
          <Text fontSize="xs" color="gray.500">
            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </Text>
        </Box>

        <Button
          colorScheme={getButtonColor()}
          size="lg"
          onClick={handleBuyTicket}
          isLoading={isLoading || isTransactionPending}
          loadingText={getButtonText()}
          disabled={isLoading || isTransactionPending || !!simulationError}
          width="full"
        >
          {(isLoading || isTransactionPending) ? <Spinner size="sm" mr={2} /> : null}
          {getButtonText()}
        </Button>

        {simulationResult && simulationResult.success && (
          <Text fontSize="xs" color="green.600" textAlign="center">
            ✅ Transaction simulation successful - Gas estimate: {simulationResult.gasUsed}
          </Text>
        )}

        {txError && !simulationError && (
          <Text fontSize="xs" color="red.500" textAlign="center">
            Error: {txError.message || 'Transaction failed'}
          </Text>
        )}

        <Text fontSize="xs" color="gray.500" textAlign="center">
          This will simulate the transaction, request approval for the payment token if needed, and purchase a lottery ticket
        </Text>
      </VStack>

      {/* Professional Error Dialog */}
      <SimulationErrorDialog
        isOpen={!!simulationError}
        onClose={clearSimulationError}
        error={simulationError || ''}
        message="The transaction simulation failed. This usually means the transaction would fail on the blockchain. Need help troubleshooting?"
        onContinueAnyway={retryWithBypass}
      />

      {/* Insufficient Balance Dialog */}
      {account && (
        <InsufficientBalanceDialog
          isOpen={insufficientBalance}
          onClose={resetInsufficientBalance}
          userAddress={account.address}
          requiredAmount={requiredAmount}
          currentBalance={currentBalance}
        />
      )}
    </>
  );
}