import { api } from './api';
import type { Lead, Discussion, LeadStatus } from '@/types/lead';

type RawLead = Omit<Lead, 'followUpAt' | 'lastDiscussionAt' | 'createdAt' | 'updatedAt'> & {
  followUpAt?: string;
  lastDiscussionAt?: string;
  createdAt: string;
  updatedAt: string;
};

type RawDiscussion = Omit<Discussion, 'followUpAt' | 'createdAt' | 'updatedAt'> & {
  followUpAt?: string;
  createdAt: string;
  updatedAt: string;
};

function parseLead(raw: RawLead): Lead {
  return {
    ...raw,
    followUpAt: raw.followUpAt ? new Date(raw.followUpAt) : undefined,
    lastDiscussionAt: raw.lastDiscussionAt ? new Date(raw.lastDiscussionAt) : undefined,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

function parseDiscussion(raw: RawDiscussion): Discussion {
  return {
    ...raw,
    followUpAt: raw.followUpAt ? new Date(raw.followUpAt) : undefined,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

export async function fetchLeads(): Promise<Lead[]> {
  const { data } = await api.get<RawLead[]>('/leads');
  return data.map(parseLead);
}

export async function fetchLead(
  id: string,
): Promise<{ lead: Lead; discussions: Discussion[] }> {
  const { data } = await api.get<{ lead: RawLead; discussions: RawDiscussion[] }>(
    `/leads/${id}`,
  );
  return {
    lead: parseLead(data.lead),
    discussions: data.discussions.map(parseDiscussion),
  };
}

export interface CreateLeadInput {
  name: string;
  company?: string;
  phone?: string;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const { data } = await api.post<RawLead>('/leads', input);
  return parseLead(data);
}

export interface UpdateLeadInput {
  name?: string;
  company?: string;
  phone?: string;
  status?: LeadStatus;
  followUpAt?: Date | null;
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
  const { data } = await api.patch<RawLead>(`/leads/${id}`, input);
  return parseLead(data);
}

export interface CreateDiscussionInput {
  note: string;
  followUpAt?: Date;
}

export async function createDiscussion(
  leadId: string,
  input: CreateDiscussionInput,
): Promise<{ discussion: Discussion; lead: Lead }> {
  const { data } = await api.post<{ discussion: RawDiscussion; lead: RawLead }>(
    `/leads/${leadId}/discussions`,
    input,
  );
  return {
    discussion: parseDiscussion(data.discussion),
    lead: parseLead(data.lead),
  };
}
