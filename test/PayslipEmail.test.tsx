import { describe, it, expect } from 'vitest';
import { generatePayslipHtml } from '../emails/PayslipEmail';

describe('PayslipEmail', () => {
  const testProps = {
    employeeName: 'John Doe',
    payPeriod: 'April 2026',
    netSalary: '25000.00',
    baseSalary: '30000.00',
    grossPay: '28000.00',
    totalDeductions: '3000.00',
    position: 'Software Engineer',
  };

  it('should render without errors', async () => {
    const html = await generatePayslipHtml(testProps);
    expect(html).toContain('John Doe');
    expect(html).toContain('April 2026');
    expect(html).toContain('25000.00');
  });

  it('should contain employee name', async () => {
    const html = await generatePayslipHtml(testProps);
    expect(html).toContain('John Doe');
  });

  it('should contain pay period', async () => {
    const html = await generatePayslipHtml(testProps);
    expect(html).toContain('April 2026');
  });

  it('should contain net salary', async () => {
    const html = await generatePayslipHtml(testProps);
    expect(html).toContain('25000.00');
  });

  it('should contain base salary', async () => {
    const html = await generatePayslipHtml(testProps);
    expect(html).toContain('30000.00');
  });

  it('should contain position', async () => {
    const html = await generatePayslipHtml(testProps);
    expect(html).toContain('Software Engineer');
  });

  it('should handle empty optional fields', async () => {
    const minimalProps = {
      employeeName: 'Jane Doe',
      payPeriod: 'March 2026',
      netSalary: '20000.00',
    };
    const html = await generatePayslipHtml(minimalProps);
    expect(html).toContain('Jane Doe');
    expect(html).toContain('0.00');
  });
});