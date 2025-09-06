import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button, 
  VStack, 
  Text, 
  HStack
} from '@chakra-ui/react';
import React from 'react';

interface SimulationErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  message?: string;
  onContinueAnyway?: () => void;
}

export function SimulationErrorDialog({
  isOpen,
  onClose,
  error,
  message = "Need help with this transaction? Check our documentation or join our community support!",
  onContinueAnyway
}: SimulationErrorDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

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
              <Text fontSize="4xl" color="red.500">⚠️</Text>
              <Text 
                fontSize="xl" 
                fontWeight="bold" 
                color="red.500"
                textAlign="center"
              >
                Transaction Error
              </Text>
            </VStack>
          </AlertDialogHeader>
          
          <VStack spacing={4} p={6} pt={0}>
            <VStack spacing={3} textAlign="center">
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Transaction Simulation Failed
              </Text>
              
              {message && (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {message}
                </Text>
              )}
              
              <Text 
                fontSize="sm" 
                color="gray.700" 
                bg="gray.50" 
                p={3} 
                borderRadius="md" 
                fontFamily="mono"
                wordBreak="break-word"
              >
                {error}
              </Text>
            </VStack>

            <AlertDialogFooter p={0} w="full">
              <VStack spacing={3} w="full">
                {onContinueAnyway && (
                  <Button
                    colorScheme="yellow"
                    size="md"
                    onClick={() => {
                      onContinueAnyway();
                      onClose();
                    }}
                    width="full"
                  >
                    Send Transaction Anyway
                  </Button>
                )}
                
                <HStack spacing={3} w="full">
                  <Button
                    ref={cancelRef}
                    variant="outline"
                    colorScheme="gray"
                    size="md"
                    onClick={onClose}
                    flex="1"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    colorScheme="blue"
                    size="md"
                    onClick={() => window.open('https://docs.vechain.org', '_blank')}
                    flex="1"
                  >
                    Get Help
                  </Button>
                </HStack>
              </VStack>
            </AlertDialogFooter>
          </VStack>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}