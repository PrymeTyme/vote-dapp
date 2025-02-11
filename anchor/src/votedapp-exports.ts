// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import VotingIDL from "../target/idl/votedapp.json";
import type { Votedapp } from "../target/types/votedapp";

// Re-export the generated IDL and type
export { Votedapp, VotingIDL };

// The programId is imported from the program IDL.
export const VOTING_PROGRAM_ID = new PublicKey(VotingIDL.address);

// This is a helper function to get the Voting Anchor program.
export function getVotingProgram(provider: AnchorProvider) {
  return new Program(VotingIDL as Votedapp, provider);
}

// This is a helper function to get the program ID for the Voting program depending on the cluster.
export function getVotingProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta":
    default:
      return VOTING_PROGRAM_ID;
  }
}
