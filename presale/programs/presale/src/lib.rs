use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod presale {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        presale_id: String,
        price_lamports: u64,
        soft_cap_lamports: u64,
        hard_cap_lamports: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        sale.authority = ctx.accounts.authority.key();
        sale.treasury = ctx.accounts.treasury.key();
        sale.vault = ctx.accounts.vault.key();
        sale.token_mint = ctx.accounts.token_mint.key();
        sale.sale_token_account = ctx.accounts.sale_token_account.key();
        sale.price_lamports = price_lamports;
        sale.soft_cap_lamports = soft_cap_lamports;
        sale.hard_cap_lamports = hard_cap_lamports;
        sale.start_time = start_time;
        sale.end_time = end_time;
        sale.total_raised = 0;
        sale.is_active = true;
        sale.presale_id = presale_id;
        Ok(())
    }

    pub fn purchase(ctx: Context<Purchase>, amount_lamports: u64) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        let clock = Clock::get()?;

        require!(sale.is_active, PresaleError::SaleNotActive);
        require!(clock.unix_timestamp >= sale.start_time, PresaleError::SaleNotStarted);
        require!(clock.unix_timestamp < sale.end_time, PresaleError::SaleEnded);
        require!(amount_lamports > 0, PresaleError::ZeroAmount);
        require!(sale.total_raised.checked_add(amount_lamports).unwrap() <= sale.hard_cap_lamports, PresaleError::HardCapExceeded);

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.purchaser.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount_lamports)?;

        sale.total_raised = sale.total_raised.checked_add(amount_lamports).unwrap();

        let purchase_record = &mut ctx.accounts.purchase_record;
        purchase_record.purchaser = ctx.accounts.purchaser.key();
        purchase_record.amount_spent = purchase_record.amount_spent.checked_add(amount_lamports).unwrap();

        Ok(())
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let treasury = &mut ctx.accounts.treasury;

        let amount_to_withdraw = vault.to_account_info().lamports();
        require!(amount_to_withdraw > 0, PresaleError::InsufficientVaultBalance);

        **vault.to_account_info().try_borrow_mut_lamports()? -= amount_to_withdraw;
        **treasury.to_account_info().try_borrow_mut_lamports()? += amount_to_withdraw;

        Ok(())
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let sale = &ctx.accounts.sale;
        let purchase_record_mut = &mut ctx.accounts.purchase_record;

        let tokens_to_claim = purchase_record_mut.amount_spent.checked_div(sale.price_lamports).unwrap();

        let authority_seeds = &[
            b"sale".as_ref(), 
            sale.presale_id.as_bytes(), 
            &[ctx.bumps.sale]
        ];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.sale_token_account.to_account_info(),
                    to: ctx.accounts.purchaser_token_account.to_account_info(),
                    authority: ctx.accounts.sale.to_account_info(),
                },
                &[&authority_seeds[..]],
            ),
            tokens_to_claim,
        )?;

        purchase_record_mut.claimed = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(presale_id: String)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + Sale::MAX_SIZE, 
        seeds = [b"sale", presale_id.as_bytes()], 
        bump
    )]
    pub sale: Account<'info, Sale>,
    #[account(
        init, 
        payer = authority, 
        space = 8, 
        seeds = [b"vault", presale_id.as_bytes()], 
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = sale
    )]
    pub sale_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut, has_one = vault)]
    pub sale: Account<'info, Sale>,
    #[account(mut, seeds = [b"vault", sale.presale_id.as_bytes()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(
        init_if_needed, 
        payer = purchaser, 
        space = 8 + PurchaseRecord::MAX_SIZE, 
        seeds = [b"purchase", sale.presale_id.as_bytes(), purchaser.key().as_ref()], 
        bump
    )]
    pub purchase_record: Account<'info, PurchaseRecord>,
    #[account(mut)]
    pub purchaser: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(mut, has_one = authority, has_one = treasury)]
    pub sale: Account<'info, Sale>,
    #[account(mut, seeds = [b"vault", sale.presale_id.as_bytes()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut, has_one = token_mint, has_one = sale_token_account, seeds = [b"sale", sale.presale_id.as_bytes()], bump)]
    pub sale: Account<'info, Sale>,
    #[account(mut, seeds = [b"purchase", sale.presale_id.as_bytes(), purchaser.key().as_ref()], bump, has_one = purchaser)]
    pub purchase_record: Account<'info, PurchaseRecord>,
    #[account(mut)]
    pub purchaser: Signer<'info>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(init_if_needed, payer = purchaser, associated_token::mint = token_mint, associated_token::authority = purchaser)]
    pub purchaser_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub sale_token_account: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Sale {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub vault: Pubkey,
    pub token_mint: Pubkey,
    pub sale_token_account: Pubkey,
    pub presale_id: String,
    pub price_lamports: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub soft_cap_lamports: u64,
    pub hard_cap_lamports: u64,
    pub total_raised: u64,
    pub is_active: bool,
}

impl Sale {
    pub const MAX_SIZE: usize = 32 * 5 + 8 * 4 + 1 + (4 + 50);
}

#[account]
#[derive(Default)]
pub struct PurchaseRecord {
    pub purchaser: Pubkey,
    pub amount_spent: u64,
    pub claimed: bool,
}

impl PurchaseRecord {
    pub const MAX_SIZE: usize = 32 + 8 + 1;
}

#[error_code]
pub enum PresaleError {
    #[msg("The sale has not started yet.")]
    SaleNotStarted,
    #[msg("The sale has already ended.")]
    SaleEnded,
    #[msg("The sale is currently not active.")]
    SaleNotActive,
    #[msg("The hard cap for this sale has been reached.")]
    HardCapExceeded,
    #[msg("The vault has an insufficient balance for withdrawal.")]
    InsufficientVaultBalance,
    #[msg("The sale has not ended yet, you cannot withdraw.")]
    SaleNotEndedYet,
    #[msg("Amount must be greater than zero.")]
    ZeroAmount,
    #[msg("You have no tokens to claim.")]
    NoTokensToClaim,
    #[msg("Tokens have already been claimed.")]
    AlreadyClaimed,
}