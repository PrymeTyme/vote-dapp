import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Votedapp } from "@/../anchor/target/types/votedapp";
import * as anchor from "@coral-xyz/anchor";

const IDL = require("../../../../anchor/target/idl/votedapp.json");

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://www.pastrywishes.com/wp-content/uploads/2020/03/peanutbutterblog1-1.jpg",
    title: "Vote for your favourite type of peanutbutter",
    description: "vote between crunchy and smooth",
    label: "Vote",
    links: {
      actions: [
        {
          type: "post",
          label: "Vote for Crunchy",
          href: "/api/vote?candidate=Crunchy",
        },
        {
          type: "post",
          label: "Vote for Smooth",
          href: "/api/vote?candidate=Smooth",
        },
      ],
    },
  };
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate != "Crunchy" && candidate != "Smooth") {
    return new Response("Invalid candidate", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: anchor.Program<Votedapp> = new anchor.Program(IDL, {
    connection,
  });
  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const instruction = await program.methods
    .vote(candidate, new anchor.BN(1))
    .accounts({ signer: voter })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction,
    },
  });
  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}
