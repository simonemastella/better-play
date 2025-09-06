import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { VeChainKitProvider } from "@vechain/vechain-kit";
import { ChakraProvider } from "@chakra-ui/react";
import { TransactionProvider } from "./context/TransactionContext";
import "./index.css";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <VeChainKitProvider
        dappKit={{}}
        network={{
          type: "test",
        }}
        loginMethods={[
          { method: "vechain", gridColumn: 4 },
          { method: "dappkit", gridColumn: 4 },
          { method: "ecosystem", gridColumn: 4 },
        ]}
        feeDelegation={{
          delegatorUrl: "https://sponsor-testnet.vechain.energy/by/90",
          delegateAllTransactions: false,
        }}
      >
        <TransactionProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </TransactionProvider>
      </VeChainKitProvider>
    </ChakraProvider>
  </React.StrictMode>
);
