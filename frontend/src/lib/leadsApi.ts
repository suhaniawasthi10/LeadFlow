import { api } from './api';
import type { Lead } from '@/types/lead';

type RawLead = Omit<Lead, 'followUpAt' | 'lastDiscussionAt' | 'createdAt' | 'updatedAt'> & {
  followUpAt?: string;
  lastDiscussionAt?: string;
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

export async function fetchLeads(): Promise<Lead[]> {
  const { data } = await api.get<RawLead[]>('/leads');
  return data.map(parseLead);
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
