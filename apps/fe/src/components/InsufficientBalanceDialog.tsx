import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button, 
  VStack, 
  Text, 
  HStack, 
  Box
} from '@chakra-ui/react';
import React from 'react';

interface InsufficientBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  requiredAmount: bigint;
  currentBalance: bigint;
}

function formatTokenAmount(amount: bigint): string {
  // Convert from wei to tokens (assuming 18 decimals)
  const tokens = Number(amount) / 10**18;
  return tokens.toFixed(4);
}

export function InsufficientBalanceDialog({
  isOpen,
  onClose,
  userAddress,
  requiredAmount,
  currentBalance
}: InsufficientBalanceDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
  const requiredTokens = formatTokenAmount(requiredAmount);
  const currentTokens = formatTokenAmount(currentBalance);
  const deficitTokens = formatTokenAmount(requiredAmount - currentBalance);

  return (
    <AlertDialog 
      isOpen={isOpen} 
      leastDestructiveRef={cancelRef}
      onClose={onClose} 
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent maxW="md" bg="white" borderRadius="lg" boxShadow="xl">
          <AlertDialogHeader>
            <VStack spacing={3} textAlign="center">
              <Text fontSize="4xl" color="orange.500">💳</Text>
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color="orange.500"
                textAlign="center"
              >
                Insufficient Balance
              </Text>
            </VStack>
          </AlertDialogHeader>
        
        <VStack spacing={4} p={6} pt={0}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800" textAlign="center">
            You don't have enough B3TR tokens
          </Text>
          
          <Box bg="gray.50" p={4} borderRadius="md" w="full">
            <VStack spacing={3}>
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">Your Address:</Text>
                <Text fontSize="sm" fontWeight="mono" color="gray.800">{shortAddress}</Text>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">Current Balance:</Text>
                <Text fontSize="sm" fontWeight="semibold" color="gray.800">{currentTokens} B3TR</Text>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">Required Amount:</Text>
                <Text fontSize="sm" fontWeight="semibold" color="orange.600">{requiredTokens} B3TR</Text>
              </HStack>
              
              <Box borderTop="1px" borderColor="gray.200" pt={2} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="red.600" fontWeight="semibold">Deficit:</Text>
                  <Text fontSize="sm" fontWeight="bold" color="red.600">{deficitTokens} B3TR</Text>
                </HStack>
              </Box>
            </VStack>
          </Box>
          
          <Text fontSize="sm" color="gray.600" textAlign="center">
            You need more B3TR tokens to complete this purchase. Please add tokens to your wallet and try again.
          </Text>

          <AlertDialogFooter p={0} w="full">
            <VStack spacing={3} w="full">
              <Button
                colorScheme="blue"
                size="md"
                onClick={() => window.open('https://app.uniswap.org', '_blank')}
                width="full"
              >
                Get B3TR Tokens
              </Button>
              
              <Button
                ref={cancelRef}
                variant="outline"
                colorScheme="gray"
                size="md"
                onClick={onClose}
                width="full"
              >
                Close
              </Button>
            </VStack>
          </AlertDialogFooter>
        </VStack>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}