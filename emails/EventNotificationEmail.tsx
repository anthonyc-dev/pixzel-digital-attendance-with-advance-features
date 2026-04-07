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

interface EventNotificationEmailProps {
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: string;
  endDate: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pixzel-digital-attendance-2026.vercel.app/Pixzel-Digital-Logo-Light-Land.png";

export const EventNotificationEmail = ({
  eventTitle,
  eventDescription,
  eventType,
  startDate,
  endDate,
}: EventNotificationEmailProps) => {
  const previewText = `New Event: ${eventTitle}`;

  const typeLabels: Record<string, string> = {
    holiday: "Holiday",
    event: "Company Event",
    meeting: "Meeting",
    other: "Other",
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`https://pixzel-digital-attendance-2026.vercel.app/Pixzel-Digital-Logo-Light-Land.png`}
              width="40"
              height="40"
              alt="Company Logo"
              style={logo}
            />
          </Section>

          <Heading style={h1}>New Event Notification</Heading>

          <Text style={text}>Dear Employee,</Text>
          <Text style={text}>
            A new <strong>{typeLabels[eventType] || eventType}</strong> has been added to the calendar.
          </Text>

          <Section style={detailsSection}>
            <div style={detailRow}>
              <Text style={label}>Event Title:</Text>
              <Text style={value}>{eventTitle}</Text>
            </div>
            {eventDescription && (
              <div style={detailRow}>
                <Text style={label}>Description:</Text>
                <Text style={value}>{eventDescription}</Text>
              </div>
            )}
            <div style={detailRow}>
              <Text style={label}>Event Type:</Text>
              <Text style={value}>{typeLabels[eventType] || eventType}</Text>
            </div>
            <div style={detailRow}>
              <Text style={label}>Start Date:</Text>
              <Text style={value}>{startDate}</Text>
            </div>
            <div style={detailRow}>
              <Text style={label}>End Date:</Text>
              <Text style={value}>{endDate}</Text>
            </div>
          </Section>

          <Text style={noteText}>
            This event has been automatically added to your attendance records.
            No action is required unless otherwise specified.
          </Text>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated notification. Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const generateEventNotificationHtml = async (
  props: EventNotificationEmailProps
) => {
  return await render(<EventNotificationEmail {...props} />);
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

const noteText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "20px 0",
  backgroundColor: "#fef3c7",
  padding: "12px",
  borderRadius: "6px",
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

export default EventNotificationEmail;