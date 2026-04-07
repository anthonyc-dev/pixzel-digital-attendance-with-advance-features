import { describe, it, expect } from 'vitest';
import { generateEventNotificationHtml } from '../emails/EventNotificationEmail';

describe('EventNotificationEmail', () => {
  const testProps = {
    eventTitle: 'Company Anniversary',
    eventDescription: 'Celebrating 10 years of success',
    eventType: 'holiday',
    startDate: '2026-04-15',
    endDate: '2026-04-15',
  };

  it('should render without errors', async () => {
    const html = await generateEventNotificationHtml(testProps);
    expect(html).toContain('Company Anniversary');
    expect(html).toContain('2026-04-15');
  });

  it('should contain event title', async () => {
    const html = await generateEventNotificationHtml(testProps);
    expect(html).toContain('Company Anniversary');
  });

  it('should contain event description', async () => {
    const html = await generateEventNotificationHtml(testProps);
    expect(html).toContain('Celebrating 10 years of success');
  });

  it('should contain start date', async () => {
    const html = await generateEventNotificationHtml(testProps);
    expect(html).toContain('2026-04-15');
  });

  it('should contain end date', async () => {
    const html = await generateEventNotificationHtml(testProps);
    expect(html).toContain('2026-04-15');
  });

  it('should handle holiday type', async () => {
    const holidayProps = { ...testProps, eventType: 'holiday' };
    const html = await generateEventNotificationHtml(holidayProps);
    expect(html).toContain('Holiday');
  });

  it('should handle event type', async () => {
    const eventProps = { ...testProps, eventType: 'event' };
    const html = await generateEventNotificationHtml(eventProps);
    expect(html).toContain('Company Event');
  });

  it('should handle meeting type', async () => {
    const meetingProps = { ...testProps, eventType: 'meeting' };
    const html = await generateEventNotificationHtml(meetingProps);
    expect(html).toContain('Meeting');
  });

  it('should handle empty description', async () => {
    const noDescProps = {
      eventTitle: 'Quick Meeting',
      eventDescription: '',
      eventType: 'meeting',
      startDate: '2026-04-20',
      endDate: '2026-04-20',
    };
    const html = await generateEventNotificationHtml(noDescProps);
    expect(html).toContain('Quick Meeting');
  });
});