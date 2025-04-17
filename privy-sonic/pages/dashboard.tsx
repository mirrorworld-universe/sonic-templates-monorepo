import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useSendTransaction } from "@privy-io/react-auth/solana";

import Head from "next/head";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export default function DashboardPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const { ready, authenticated, user, logout } = usePrivy();
  const { sendTransaction } = useSendTransaction();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  useEffect(() => {
    async function fetchBalance() {
      if (user?.wallet?.address) {
        const walletBalance = await getBalance(user.wallet.address);
        setBalance(walletBalance);
      }
    }

    if (user?.wallet) {
      fetchBalance();
    }
  }, [user?.wallet]);

  async function getBalance(userWalletAddress: string) {
    const connection = new Connection(
      "https://rpc.mainnet-alpha.sonic.game",
      "confirmed"
    );

    const balance = await connection.getBalance(
      new PublicKey(userWalletAddress)
    );

    return balance;
  }

  function handleSelfButtonClick() {
    if (user?.wallet?.address) {
      setRecipientAddress(user.wallet.address);
      setValidationError("");
    }
  }

  function validateAddress(address: string): boolean {
    if (!address.trim()) {
      setValidationError("Recipient address cannot be empty");
      return false;
    }

    try {
      new PublicKey(address);
      setValidationError("");
      return true;
    } catch (error) {
      setValidationError("Invalid Solana address format");
      return false;
    }
  }

  async function sendSol(
    userWalletAddress: string,
    amount: number,
    recipientWalletAddress: string
  ) {
    if (!validateAddress(recipientWalletAddress)) {
      return;
    }

    const connection = new Connection(
      "https://rpc.mainnet-alpha.sonic.game",
      "confirmed"
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userWalletAddress),
        toPubkey: new PublicKey(recipientWalletAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = new PublicKey(userWalletAddress);

    const receipt = await sendTransaction({
      transaction,
      connection,
    });

    // Set transaction signature in state
    setTxSignature(receipt.signature);

    console.log(
      "Transaction sent with signature:",
      `https://explorer.sonic.game/tx/${receipt.signature}`
    );
  }

  function formatBalance(balance: number | null): string {
    if (balance === null) return "Loading...";
    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    return (balance / LAMPORTS_PER_SOL).toFixed(9) + " SOL";
  }

  return (
    <>
      <Head>
        <title>SonicSVM x Privy Auth Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen bg-privy-light-blue">
        {ready && authenticated ? (
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="flex flex-row justify-between items-center mb-12">
              <h1 className="text-2xl font-semibold">Privy Auth Demo</h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:bg-violet-300 hover:text-violet-900 py-2 px-6 rounded-md text-violet-700 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="flex flex-col items-center gap-8 mb-12">
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-3 text-center">
                  SonicSVM Address
                </h2>
                <div className="bg-slate-700 text-slate-50 font-mono p-4 rounded-lg text-center break-all shadow-md">
                  {user?.wallet?.address || "No wallet connected"}
                </div>
              </div>

              <div className="w-full max-w-md">
                <h2 className="text-xl font-semibold mb-3 text-center">
                  Balance
                </h2>
                <div className="bg-slate-700 text-slate-50 font-mono p-4 rounded-lg text-center shadow-md">
                  {formatBalance(balance)}
                </div>
              </div>

              {txSignature && (
                <div className="w-full">
                  <h2 className="text-xl font-semibold mb-3 text-center">
                    Transaction
                  </h2>
                  <div className="bg-slate-700 text-slate-50 p-4 rounded-lg shadow-md">
                    <p className="font-mono text-xs mb-2 break-all">
                      {txSignature}
                    </p>
                    <a
                      href={`https://explorer.sonic.game/tx/${txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-300 hover:text-violet-100 text-sm font-medium inline-flex items-center transition-colors"
                    >
                      View on Explorer
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              )}

              <div className="mt-4 w-full max-w-md">
                <div className="mb-4">
                  <label
                    htmlFor="recipient-address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Recipient Address
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-grow relative">
                      <input
                        id="recipient-address"
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="Enter Solana address"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                      />
                      {validationError && (
                        <p className="text-red-500 text-xs mt-1 absolute">
                          {validationError}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSelfButtonClick}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                    >
                      Self
                    </button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() =>
                      sendSol(user?.wallet?.address!, 0.001, recipientAddress)
                    }
                    className="bg-violet-600 hover:bg-violet-700 text-white py-3 px-8 rounded-md font-medium shadow-md transition-colors"
                  >
                    Send SOL
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
