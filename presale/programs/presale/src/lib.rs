use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

// Zaktualizuj ID programu po wdrożeniu nowej wersji
declare_id!("9oemjxjE2zFJFVRynHVmWg1nTMWgTM3hGCetuAJkG21U");

#[program]
pub mod phoenix_presale {
    use super::*;

    // ZMIANA: Dodano 'presale_id' do tworzenia unikalnych przedsprzedaży
    pub fn initialize(
        ctx: Context<Initialize>,
        _presale_id: String, // Używane tylko do wyprowadzenia PDA
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
        sale.token_mint = ctx.accounts.token_mint.key(); // Implementacja punktu 1.11 z planu
        sale.sale_token_account = ctx.accounts.sale_token_account.key(); // Implementacja punktu 1.11

        sale.price_lamports = price_lamports;
        sale.soft_cap_lamports = soft_cap_lamports;
        sale.hard_cap_lamports = hard_cap_lamports;
        
        sale.start_time = start_time;
        sale.end_time = end_time;
        sale.total_raised = 0;
        sale.is_active = true;
        
        msg!("Presale initialized!");
        Ok(())
    }

    pub fn purchase(ctx: Context<Purchase>, amount_lamports: u64) -> Result<()> {
        let sale = &mut ctx.accounts.sale;
        let clock = Clock::get()?;

        require!(sale.is_active, PresaleError::SaleNotActive); // Implementacja punktu 1.10
        require!(clock.unix_timestamp >= sale.start_time, PresaleError::SaleNotStarted); // Implementacja punktu 1.10
        require!(clock.unix_timestamp < sale.end_time, PresaleError::SaleEnded); // Implementacja punktu 1.10
        require!(amount_lamports > 0, PresaleError::ZeroAmount);
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
        
        msg!("User {} purchased for {} lamports.", purchase_record.purchaser, amount_lamports);
        Ok(())
    }

    pub fn withdraw_sol(ctx: Context<WithdrawSol>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let treasury = &mut ctx.accounts.treasury;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= ctx.accounts.sale.end_time, PresaleError::SaleNotEndedYet); // Implementacja punktu 1.13
        
        let amount_to_withdraw = vault.to_account_info().lamports();
        require!(amount_to_withdraw > 0, PresaleError::InsufficientVaultBalance);

        **vault.to_account_info().try_borrow_mut_lamports()? -= amount_to_withdraw;
        **treasury.to_account_info().try_borrow_mut_lamports()? += amount_to_withdraw;

        msg!("Withdrew {} lamports from the vault to the treasury.", amount_to_withdraw);
        Ok(())
    }
    
    // Implementacja punktu 1.8 i 1.9 z planu
    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let sale = &ctx.accounts.sale;
        let purchase_record = &mut ctx.accounts.purchase_record;
        let clock = Clock::get()?;

        require!(clock.unix_timestamp >= sale.end_time, PresaleError::SaleNotEndedYet);
        require!(purchase_record.amount_spent > 0, PresaleError::NoTokensToClaim);
        require!(!purchase_record.claimed, PresaleError::AlreadyClaimed);

        let tokens_to_claim = purchase_record.amount_spent.checked_div(sale.price_lamports).unwrap();
        
        let presale_id = ctx.accounts.sale.presale_id.as_bytes();
        let authority_seeds = &[b"sale".as_ref(), presale_id.as_ref(), &[*ctx.bumps.get("sale").unwrap()]];
        
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

        purchase_record.claimed = true; // Zabezpieczenie przed podwójnym odbiorem

        msg!("User {} claimed {} tokens.", ctx.accounts.purchaser.key(), tokens_to_claim);
        Ok(())
    }
}

// ZMIANA: Kontekst z 'presale_id'
#[derive(Accounts)]
#[instruction(_presale_id: String)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + Sale::INIT_SPACE, seeds = [b"sale", _presale_id.as_bytes()], bump)]
    pub sale: Account<'info, Sale>,
    #[account(init, payer = authority, space = 0, seeds = [b"vault", _presale_id.as_bytes()], bump)]
    pub vault: SystemAccount<'info>,
    pub token_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        associated_token::mint = token_mint,
        associated_token::authority = sale // 'sale' PDA jest właścicielem tego konta
    )]
    pub sale_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Adres skarbnicy
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(presale_id: String)]
pub struct Purchase<'info> {
    #[account(mut, seeds = [b"sale", presale_id.as_bytes()], bump, has_one = vault)]
    pub sale: Account<'info, Sale>,
    #[account(mut, seeds = [b"vault", presale_id.as_bytes()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(init_if_needed, payer = purchaser, space = 8 + PurchaseRecord::INIT_SPACE, seeds = [b"purchase", presale_id.as_bytes(), purchaser.key().as_ref()], bump)]
    pub purchase_record: Account<'info, PurchaseRecord>,
    #[account(mut)]
    pub purchaser: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(presale_id: String)]
pub struct WithdrawSol<'info> {
    #[account(mut, has_one = authority, has_one = treasury, seeds = [b"sale", presale_id.as_bytes()], bump)]
    pub sale: Account<'info, Sale>,
    #[account(mut, seeds = [b"vault", presale_id.as_bytes()], bump)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(presale_id: String)]
pub struct ClaimTokens<'info> {
    #[account(seeds = [b"sale", presale_id.as_bytes()], bump, has_one = token_mint, has_one = sale_token_account)]
    pub sale: Account<'info, Sale>,
    #[account(mut, seeds = [b"purchase", presale_id.as_bytes(), purchaser.key().as_ref()], bump, has_one = purchaser)]
    pub purchase_record: Account<'info, PurchaseRecord>,
    #[account(mut)]
    pub purchaser: Signer<'info>,
    #[account(mut)]
    pub token_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = purchaser,
        associated_token::mint = token_mint,
        associated_token::authority = purchaser
    )]
    pub purchaser_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub sale_token_account: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)] 
pub struct Sale {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub vault: Pubkey,
    pub token_mint: Pubkey,
    pub sale_token_account: Pubkey,
    #[max_len(50)] // Ograniczenie długości ID
    pub presale_id: String,
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
    pub purchaser: Pubkey,
    pub amount_spent: u64,
    pub claimed: bool,
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