use anchor_lang::prelude::*;

declare_id!("41zCE7RUc72gTEpfnLTEtW7NFpxyag3opunpj5swYe34");

pub mod program  {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
