import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { Counter } from "../target/types/counter";

describe("counter", () => {
  // 本地 provider，默认使用 Anchor.toml 里的配置
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Counter as Program<Counter>;
  const user = provider.wallet as anchor.Wallet;

  // PDA + bump
  let counterPda: anchor.web3.PublicKey;
  let bump: number;

  before(async () => {
    [counterPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("counter"), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it("初始化计数器", async () => {
    await program.methods
      .initialize()
      .accounts({
        user: user.publicKey,
        counter: counterPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    const account = await program.account.counter.fetch(counterPda);
    assert.equal(account.count.toNumber(), 0, "初始化时应为 0");
  });

  it("计数器 +1", async () => {
    await program.methods
      .increment()
      .accounts({
        user: user.publicKey,
        counter: counterPda,
      })
      .rpc();

    const account = await program.account.counter.fetch(counterPda);
    assert.equal(account.count.toNumber(), 1, "递增后应为 1");
  });
});
