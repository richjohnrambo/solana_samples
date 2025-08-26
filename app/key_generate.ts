import * as anchor from "@coral-xyz/anchor";

// 1️⃣ 内置钱包 Keypair
const secret = Uint8Array.from([
  110, 245, 220, 67, 97, 252, 117, 247, 255, 26, 19, 237, 5, 230, 3, 140, 6,
  147, 58, 13, 102, 14, 165, 238, 197, 232, 247, 244, 231, 201, 237, 144, 161,
  55, 165, 199, 174, 119, 155, 170, 102, 65, 189, 178, 123, 255, 227, 110, 82,
  175, 130, 187, 176, 79, 168, 213, 14, 24, 151, 205, 247, 37, 102, 227,
]);
const user = anchor.web3.Keypair.fromSecretKey(secret);
console.log("User pubkey:", user.publicKey.toBase58());

// 2️⃣ 自定义 Wallet 适配新版 Anchor
const wallet = {
  publicKey: user.publicKey,
  signTransaction: async (tx: anchor.web3.Transaction) => {
    tx.partialSign(user);
    return tx;
  },
  signAllTransactions: async (txs: anchor.web3.Transaction[]) => {
    return txs.map((tx) => {
      tx.partialSign(user);
      return tx;
    });
  },
};

// 3️⃣ Anchor Provider
const connection = new anchor.web3.Connection(
  "https://api.devnet.solana.com",
  "confirmed"
);
const provider = new anchor.AnchorProvider(
  connection,
  wallet as anchor.Wallet,
  {}
);
anchor.setProvider(provider);

// 4️⃣ Program ID
const programId = new anchor.web3.PublicKey(
  "2VVBdyGUuaMERbCoRCkHAj6sHH349jqfLMJneyXXTW5K"
);

// 5️⃣ 内嵌 IDL
const idl = {
  version: "0.1.0",
  name: "counter",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "counter", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "increment",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "counter", isMut: true, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "counter",
      type: { kind: "struct", fields: [{ name: "count", type: "u64" }] },
    },
  ],
};

// 6️⃣ 创建 Program
const program = new anchor.Program(idl as any, programId, provider);

// 7️⃣ 派生 Counter PDA
const [counterPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("counter"), user.publicKey.toBuffer()],
  program.programId
);
console.log("Counter PDA:", counterPda.toBase58());
console.log("bump:", bump);

async function run() {
  // 8️⃣ 初始化 PDA
  console.log("Initializing counter...");
  await program.methods
    .initialize()
    .accounts({
      user: user.publicKey,
      counter: counterPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([user])
    .rpc();
  console.log("Counter initialized!");

  // 9️⃣ increment
  console.log("Incrementing counter...");
  await program.methods
    .increment()
    .accounts({
      user: user.publicKey,
      counter: counterPda,
    })
    .signers([user])
    .rpc();
  console.log("Counter incremented!");

  // 🔟 查询当前计数
  const counterAccount = await program.account.counter.fetch(counterPda);
  console.log("Current counter value:", counterAccount.count.toString());
}

run().catch(console.error);
