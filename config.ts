// @noErrors
import { createConfig, cookieStorage } from "@account-kit/react";
import { AlchemySignerWebClient } from "@account-kit/signer";
import { QueryClient } from "@tanstack/react-query";
import { sepolia, alchemy } from "@account-kit/infra";
import { sha256, stringToBytes } from "viem";

let client: AlchemySignerWebClient | null = null;

const getClient = (): AlchemySignerWebClient => {
  if (!client) {
    if (typeof window !== "undefined") {
      const initClient = () => {
        if (!client) {
          client = new AlchemySignerWebClient({
            connection: {
              apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
            },
            iframeConfig: {
              iframeContainerId: "signer-iframe-container",
            },
          });
        }
      };

      if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
      ) {
        initClient();
      } else {
        document.addEventListener("DOMContentLoaded", initClient, {
          once: true,
        });
      }
    } else {
      throw new Error(
        "AlchemySignerWebClient can only be initialized in browser environment"
      );
    }
  }
  if (!client) {
    throw new Error("AlchemySignerWebClient not initialized");
  }
  return client!;
};

export const getNonce = async (): Promise<string> => {
  const clientInstance = getClient();
  const targetPublicKey = await clientInstance.targetPublicKey();
  const nonce = sha256(stringToBytes(targetPublicKey)).slice(2);

  return nonce;
};

export const config = createConfig(
  {
    transport: alchemy({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
    }),
    chain: sepolia,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
    sessionConfig: {
      expirationTimeMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    // For gas sponsorship
    // Learn more here: https://www.alchemy.com/docs/wallets/transactions/sponsor-gas/sponsor-gas-evm
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
  },
  {
    auth: {
      sections: [
        [{ type: "email" }],
        [
          {
            authProviderId: "auth0",
            mode: "popup",
            type: "social",
            displayName: "AGIO",
            logoUrl: "./agio-logo.png",
            auth0Connection: "Username-Password-Authentication",
          },
        ],
      ],
      addPasskeyOnSignup: true,
    },
  }
);

export const queryClient = new QueryClient();
