use anchor_lang::prelude::*;

declare_id!("6DuQDxzyiaRUc3WDd7CB1KKdYBokEdQmoJ5D7kKZYd9i");

#[program]
pub mod solana_samples {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
