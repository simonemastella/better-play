import { useWallet, WalletButton } from "@vechain/vechain-kit";
import { Button } from "@chakra-ui/react";

export function ConnectButton() {
  const { account, connection, disconnect } = useWallet();

  if (connection.isConnected && account?.address) {
    return (
      <Button colorScheme="red" onClick={disconnect}>
        Disconnect {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </Button>
    );
  }

  return (
    <WalletButton 
      connectionVariant="modal"
      buttonStyle={{
        backgroundColor: '#3182CE',
        textColor: 'white',
        fontFamily: 'inherit',
        fontSize: '1rem',
        padding: '0.5rem 1rem',
        rounded: '6px',
        _hover: {
          backgroundColor: '#2C5282'
        }
      }}
    />
  );
}