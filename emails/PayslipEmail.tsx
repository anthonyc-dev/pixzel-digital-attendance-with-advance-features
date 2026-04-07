import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

interface PayslipEmailProps {
  employeeName: string;
  payPeriod: string;
  netSalary: string;
  baseSalary?: string;
  grossPay?: string;
  totalDeductions?: string;
  position?: string;
}

export const PayslipEmail = ({
  employeeName,
  payPeriod,
  netSalary,
  baseSalary = "0.00",
  grossPay = "0.00",
  totalDeductions = "0.00",
  position,
}: PayslipEmailProps) => {
  const previewText = `Payslip for ${payPeriod}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={"https://pixzel-digital-attendance-2026.vercel.app/Pixzel-Digital-Logo-Light-Land.png"}
              width="40"
              height="40"
              alt="Company Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1}>Payslip</Heading>

          <Text style={text}>Dear {employeeName},</Text>
          <Text style={text}>
            Your payslip for <strong>{payPeriod}</strong> is ready.
          </Text>

          <Section style={detailsSection}>
            <div style={detailRow}>
              <Text style={label}>Employee Name:</Text>
              <Text style={value}>{employeeName}</Text>
            </div>
            {position && (
              <div style={detailRow}>
                <Text style={label}>Position:</Text>
                <Text style={value}>{position}</Text>
              </div>
            )}
            <div style={detailRow}>
              <Text style={label}>Pay Period:</Text>
              <Text style={value}>{payPeriod}</Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={salarySection}>
            <Heading style={h2}>Salary Details</Heading>

            <div style={detailRow}>
              <Text style={label}>Base Salary:</Text>
              <Text style={value}>₱{baseSalary}</Text>
            </div>
            <div style={detailRow}>
              <Text style={label}>Gross Pay:</Text>
              <Text style={value}>₱{grossPay}</Text>
            </div>
            <div style={detailRow}>
              <Text style={label}>Total Deductions:</Text>
              <Text style={value}>₱{totalDeductions}</Text>
            </div>
            <Hr style={hr} />
            <div style={detailRow}>
              <Text style={labelBold}>Net Salary:</Text>
              <Text style={valueBold}>₱{netSalary}</Text>
            </div>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated message. Please do not reply to this email.
            </Text>
            <Text style={footerText}>
              If you have any questions, please contact the HR department.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const generatePayslipHtml = async (props: PayslipEmailProps) => {
  return await render(<PayslipEmail {...props} />);
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 0",
  maxWidth: "580px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "20px",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "30px 0",
};

const h2 = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "600",
  margin: "20px 0 15px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const detailsSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
};

const salarySection = {
  margin: "20px 0",
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

const label = {
  color: "#6b7280",
  fontSize: "14px",
  fontWeight: "500",
};

const value = {
  color: "#1f2937",
  fontSize: "14px",
  fontWeight: "400",
};

const labelBold = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "700",
};

const valueBold = {
  color: "#059669",
  fontSize: "18px",
  fontWeight: "700",
};

const hr = {
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: "20px 0",
};

const footerSection = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "20px",
  margin: "8px 0",
};

export default PayslipEmail;