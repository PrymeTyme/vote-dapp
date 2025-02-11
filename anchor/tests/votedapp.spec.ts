import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Votedapp } from "../target/types/votedapp";
import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

const IDL = require("../target/idl/votedapp.json");

const votingAdress = new PublicKey(
  "39Vza1bkFhFuLxrFimGzU1Z9HeoX2Rvpvv8McXxVJVP9"
);

describe("votedapp", () => {
  let context: any;
  let provider: BankrunProvider;
  anchor.setProvider(anchor.AnchorProvider.env());
  let votingProgram: Program<Votedapp> = anchor.workspace.Votedapp;

  beforeAll(async () => {
    /*context = await startAnchor(
      "",
      [{ name: "votedapp", programId: votingAdress }],
      []
    );

    provider = new BankrunProvider(context);

    votingProgram = new Program<Votedapp>(IDL, provider);*/
  });

  it("Initialize Poll", async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        new anchor.BN(0),
        new anchor.BN(1834606833),
        "waht is your favorite peanut butter?"
      )
      .rpc();

    const [pollAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAdress
    );

    const poll = await votingProgram.account.poll.fetch(pollAdress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("waht is your favorite peanut butter?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("initialize candidate", async () => {
    await votingProgram.methods
      .initializeCanditate("Smooth", new anchor.BN(1))
      .rpc();
    await votingProgram.methods
      .initializeCanditate("Crunchy", new anchor.BN(1))
      .rpc();

    const [crunchyAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Crunchy")],
      votingAdress
    );
    const crunchyCandidate = await votingProgram.account.candidate.fetch(
      crunchyAdress
    );
    console.log(crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);

    const [smoothAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAdress
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAdress
    );
    console.log(smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);
  });

  it("vote", async () => {
    await votingProgram.methods.vote("Smooth", new anchor.BN(1)).rpc();
    const [smoothAdress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAdress
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAdress
    );
    console.log(smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1);
  });
});
