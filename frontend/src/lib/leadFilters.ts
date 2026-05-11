import { addDays, endOfDay, isToday, isWithinInterval, startOfDay } from 'date-fns';
import type { Lead } from '@/types/lead';

export function isOverdue(lead: Lead): boolean {
  if (!lead.followUpAt) return false;
  if (lead.status === 'Won' || lead.status === 'Lost') return false;
  return lead.followUpAt < startOfDay(new Date());
}

export function isFollowUpToday(lead: Lead): boolean {
  return lead.followUpAt ? isToday(lead.followUpAt) : false;
}

// "This week" = today through 7 days from now (rolling), matches backend semantics
export function isFollowUpThisWeek(lead: Lead): boolean {
  if (!lead.followUpAt) return false;
  const now = new Date();
  return isWithinInterval(lead.followUpAt, {
    start: startOfDay(now),
    end: endOfDay(addDays(now, 7)),
  });
}

export function hasNoFollowUp(lead: Lead): boolean {
  return !lead.followUpAt;
}
