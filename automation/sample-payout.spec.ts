/**
 * Sample Playwright + TypeScript regression test for the Payout Engine.
 * Uses the Page Object Model pattern. All data below is DUMMY/SAMPLE data
 * for portfolio demonstration only — no real credentials or endpoints.
 */

import { test, expect, Page } from '@playwright/test';

// ── Dummy test data ─────────────────────────────────────────────
const DUMMY_MERCHANT = {
  id: 'DEMOMERCHANT001',
  password: 'Dummy@Passw0rd',
};

const DUMMY_BENEFICIARY = {
  name: 'Demo Vendor Pvt Ltd',
  accountNumber: '000987654321',
  ifsc: 'DEMO0005678',
};

// ── Page Objects ─────────────────────────────────────────────────
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async loginAs(merchantId: string, password: string) {
    await this.page.getByLabel('Merchant ID').fill(merchantId);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }
}

class BeneficiaryPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.getByRole('link', { name: 'Beneficiary' }).click();
  }

  async createBeneficiary(name: string, accountNumber: string, ifsc: string) {
    await this.page.getByLabel('Beneficiary Name').fill(name);
    await this.page.getByLabel('Account Number').fill(accountNumber);
    await this.page.getByLabel('IFSC').fill(ifsc);
    await this.page.getByRole('button', { name: 'Add Beneficiary' }).click();
  }

  async getApprovalStatusText() {
    return this.page.getByTestId('beneficiary-status').innerText();
  }
}

class PayoutPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.getByRole('link', { name: 'Payout' }).click();
  }

  async initiatePayout(beneficiaryName: string, amount: string, mode: 'IMPS' | 'NEFT' | 'RTGS') {
    await this.page.getByLabel('Beneficiary').selectOption({ label: beneficiaryName });
    await this.page.getByLabel('Amount').fill(amount);
    await this.page.getByLabel('Transfer Mode').selectOption(mode);
    await this.page.getByRole('button', { name: 'Send Payout' }).click();
  }

  async getErrorMessage() {
    return this.page.getByTestId('payout-error').innerText();
  }

  async getStatusBadgeText() {
    return this.page.getByTestId('payout-status-badge').innerText();
  }
}

// ── Tests ────────────────────────────────────────────────────────
test.describe('Payout Engine — Primary Regression Flow', () => {
  test('merchant can log in and reach the dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    await expect(page).toHaveURL(/dashboard/);
  });

  test('newly created beneficiary starts as Pending Approval', async ({ page }) => {
    const login = new LoginPage(page);
    const beneficiary = new BeneficiaryPage(page);

    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    await beneficiary.goto();
    await beneficiary.createBeneficiary(
      DUMMY_BENEFICIARY.name,
      DUMMY_BENEFICIARY.accountNumber,
      DUMMY_BENEFICIARY.ifsc,
    );

    await expect(beneficiary.getApprovalStatusText()).resolves.toMatch(/Pending Approval/i);
  });

  test('payout is blocked against an unapproved beneficiary', async ({ page }) => {
    const login = new LoginPage(page);
    const beneficiary = new BeneficiaryPage(page);
    const payout = new PayoutPage(page);

    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    await beneficiary.goto();
    await beneficiary.createBeneficiary(
      DUMMY_BENEFICIARY.name,
      DUMMY_BENEFICIARY.accountNumber,
      DUMMY_BENEFICIARY.ifsc,
    );

    // Beneficiary is still Pending Approval — payout must be blocked
    await payout.goto();
    await payout.initiatePayout(DUMMY_BENEFICIARY.name, '500', 'IMPS');

    await expect(payout.getErrorMessage()).resolves.toMatch(/approv/i);
  });

  test('RTGS payout below the minimum amount is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    const payout = new PayoutPage(page);

    await login.goto();
    await login.loginAs(DUMMY_MERCHANT.id, DUMMY_MERCHANT.password);

    await payout.goto();
    // Assumes an already-approved dummy beneficiary exists in test data
    await payout.initiatePayout(DUMMY_BENEFICIARY.name, '50', 'RTGS');

    await expect(payout.getErrorMessage()).resolves.toMatch(/minimum/i);
  });
});
