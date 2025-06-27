// programs/presale/src/lib.rs
use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod phoenix_presale {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        price_sol: f64,
        soft_cap_sol: f64,
        hard_cap_sol: f64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        sale.authority = ctx.accounts.authority.key();
        sale.treasury = ctx.accounts.treasury.key();
        sale.vault = ctx.accounts.vault.key();

        sale.price_lamports = (price_sol * 1_000_000_000.0) as u64;
        sale.soft_cap_lamports = (soft_cap_sol * 1_000_000_000.0) as u64;
        sale.hard_cap_lamports = (hard_cap_sol * 1_000_000_000.0) as u64;

        sale.start_time = start_time;
        sale.end_time = end_time;
        sale.total_raised = 0;
        sale.is_active = true;

        msg!("Przedsprzedaż zainicjalizowana!");
        msg!("Cena za token: {} lamportów", sale.price_lamports);
        msg!("Hard Cap: {} lamportów", sale.hard_cap_lamports);
        msg!("Skarbiec projektu: {}", sale.treasury);
        msg!("Sejf kontraktu (Vault): {}", sale.vault);

        Ok(())
    }

    pub fn purchase(ctx: Context<Purchase>, amount_sol: f64) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        let clock = Clock::get()?;
        let amount_lamports = (amount_sol * 1_000_000_000.0) as u64;

        require!(sale.is_active, PresaleError::SaleNotActive);
        require!(clock.unix_timestamp >= sale.start_time, PresaleError::SaleNotStarted);
        require!(clock.unix_timestamp < sale.end_time, PresaleError::SaleEnded);
        require!(sale.total_raised.checked_add(amount_lamports).unwrap() <= sale.hard_cap_lamports, PresaleError::HardCapExceeded);

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.purchaser.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount_lamports)?;

        sale.total_raised = sale.total_raised.checked_add(amount_lamports).unwrap();

        let purchase_record = &mut ctx.accounts.purchase_record;
        if purchase_record.purchaser == Pubkey::default() {
            purchase_record.purchaser = ctx.accounts.purchaser.key();
        }
        purchase_record.amount_spent = purchase_record.amount_spent.checked_add(amount_lamports).unwrap();

        msg!("Użytkownik {} zakupił tokeny za {} lamportów.", purchase_record.purchaser, amount_lamports);
        Ok(())
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>) -> Result<()> {
        let sale = &ctx.accounts.sale;
        let vault = &mut ctx.accounts.vault;
        let treasury = &mut ctx.accounts.treasury;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= sale.end_time, PresaleError::SaleNotEndedYet);

        let amount_to_withdraw = vault.lamports();
        require!(amount_to_withdraw > 0, PresaleError::InsufficientVaultBalance);

        **vault.to_account_info().try_borrow_mut_lamports()? -= amount_to_withdraw;
        **treasury.to_account_info().try_borrow_mut_lamports()? += amount_to_withdraw;

        msg!("Wypłacono {} lamportów z sejfu do skarbca.", amount_to_withdraw);
        Ok(())
    }

    pub fn claim_tokens(_ctx: Context<ClaimTokens>) -> Result<()> {
        msg!("Logika odbioru tokenów zostanie zaimplementowana w przyszłości.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Sale::INIT_SPACE,
        seeds = [b"sale"],
        bump
    )]
    pub sale: Account<'info, Sale>,

    #[account(
        init,
        payer = authority,
        space = 8,
        seeds = [b"vault"],
        bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut, seeds = [b"sale"], bump)]
    pub sale: Account<'info, Sale>,

    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: SystemAccount<'info>,

    #[account(
        init_if_needed,
        payer = purchaser,
        space = 8 + PurchaseRecord::INIT_SPACE,
        seeds = [b"purchase", purchaser.key().as_ref()],
        bump
    )]
    pub purchase_record: Account<'info, PurchaseRecord>,

    #[account(mut)]
    pub purchaser: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(mut, has_one = authority, has_one = treasury, seeds = [b"sale"], bump)]
    pub sale: Account<'info, Sale>,

    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: SystemAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimTokens {}

#[account]
#[derive(InitSpace)]
pub struct Sale {
    pub authority: Pubkey,       // POPRAWKA: PublicKey -> Pubkey
    pub treasury: Pubkey,        // POPRAWKA: PublicKey -> Pubkey
    pub vault: Pubkey,           // POPRAWKA: PublicKey -> Pubkey
    pub price_lamports: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub soft_cap_lamports: u64,
    pub hard_cap_lamports: u64,
    pub total_raised: u64,
    pub is_active: bool,
}

#[account]
#[derive(InitSpace, Default)]
pub struct PurchaseRecord {
    pub purchaser: Pubkey,       // POPRAWKA: PublicKey -> Pubkey
    pub amount_spent: u64,
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
}