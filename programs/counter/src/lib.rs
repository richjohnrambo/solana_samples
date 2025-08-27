use anchor_lang::prelude::*;

declare_id!("D7PEf3g3HkSescT33Sk3VeC4mXFa9eT6QeHLGo7NegJv");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod counter {
    use super::*;

    /// 初始化 PDA 账户，count = 0
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    /// 计数器 +1
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// 使用 seed 派生 PDA 账户，首次调用时创建
    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Counter::INIT_SPACE,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    pub user: Signer<'info>,

    /// 访问同一个 PDA 账户（必须和 Initialize 一致的 seeds）
    #[account(
        mut,
        seeds = [b"counter", user.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, Counter>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
}
