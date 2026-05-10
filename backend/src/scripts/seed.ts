import 'dotenv/config';
import mongoose from 'mongoose';
import { addDays, subHours } from 'date-fns';
import { connectDB } from '../config/db';
import { Lead } from '../models/Lead';
import { Discussion } from '../models/Discussion';
import { LeadStatus } from '../types/lead';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/leadflow';

type SeedDiscussion = {
  note: string;
  hoursAgo: number;
  followUpDays?: number;
};

type SeedLead = {
  name: string;
  company: string;
  phone?: string;
  status: LeadStatus;
  discussions: SeedDiscussion[];
};

const seedLeads: SeedLead[] = [
  {
    name: 'Sarah Connor',
    company: 'Acme Corp',
    phone: '555-0199',
    status: 'Proposal Sent',
    discussions: [
      { note: 'Initial cold call — interested in our enterprise tier.', hoursAgo: 96 },
      { note: 'Demo scheduled for Friday. CFO is the key decision-maker.', hoursAgo: 48 },
      {
        note: 'Demo went well. Sent the proposal — needs CFO sign-off this week.',
        hoursAgo: 6,
        followUpDays: 0,
      },
    ],
  },
  {
    name: 'Hank Scorpio',
    company: 'Globex Corporation',
    phone: '555-0144',
    status: 'New',
    discussions: [
      { note: 'Inbound — wants a friendly chat about our roadmap.', hoursAgo: 2 },
    ],
  },
  {
    name: 'Bill Lumbergh',
    company: 'Initech',
    phone: '555-0177',
    status: 'Contacted',
    discussions: [
      { note: 'Reached out via email last week. No response yet.', hoursAgo: 168 },
      {
        note: 'Left a voicemail. Following up if no response by Wednesday.',
        hoursAgo: 72,
        followUpDays: -2,
      },
    ],
  },
  {
    name: 'Tony Stark',
    company: 'Stark Industries',
    phone: '555-0188',
    status: 'Qualified',
    discussions: [
      { note: 'Discovery call. Pain point: legacy CRM falling over at scale.', hoursAgo: 120 },
      { note: 'Sent over case studies. Tony wants to talk integrations.', hoursAgo: 72 },
      {
        note: 'Integration architect call booked. Pepper will join too.',
        hoursAgo: 12,
        followUpDays: 3,
      },
    ],
  },
  {
    name: 'Bruce Wayne',
    company: 'Wayne Enterprises',
    phone: '555-0123',
    status: 'Won',
    discussions: [
      { note: 'Initial intro — exploring options for the Foundation team.', hoursAgo: 240 },
      { note: 'Mid-cycle review with the team. Strong technical fit.', hoursAgo: 144 },
      { note: 'Contract signed. Onboarding kicks off next month.', hoursAgo: 24 },
    ],
  },
  {
    name: 'Walter White',
    company: 'Gray Matter',
    phone: '555-0166',
    status: 'Lost',
    discussions: [
      { note: 'Initial call. Walter is researching the space.', hoursAgo: 480 },
      { note: 'Demoed core features. Concerned about pricing.', hoursAgo: 360 },
      { note: 'Lost to a competitor — they offered an aggressive discount.', hoursAgo: 96 },
    ],
  },
];

async function seed(): Promise<void> {
  await connectDB(MONGO_URI);
  console.log('[seed] connected');

  // Always clear before seeding — this is a deterministic fixture, not a migration.
  await Promise.all([Lead.deleteMany({}), Discussion.deleteMany({})]);
  console.log('[seed] cleared collections');

  const now = new Date();

  for (const seedLead of seedLeads) {
    // Newest discussion drives the lead's denormalized fields and follow-up.
    const newestFirst = [...seedLead.discussions].sort((a, b) => a.hoursAgo - b.hoursAgo);
    const latest = newestFirst[0];

    const followUpAt =
      latest.followUpDays !== undefined ? addDays(now, latest.followUpDays) : undefined;

    const lead = await Lead.create({
      name: seedLead.name,
      company: seedLead.company,
      phone: seedLead.phone,
      status: seedLead.status,
      followUpAt,
      lastDiscussionNote: latest.note,
      lastDiscussionAt: subHours(now, latest.hoursAgo),
    });

    // Bypass Mongoose's auto-timestamps so we can backdate discussions for
    // realistic "X hours ago" labels in the UI.
    const discussionDocs = seedLead.discussions.map((d) => ({
      leadId: lead._id,
      note: d.note,
      followUpAt: d.followUpDays !== undefined ? addDays(now, d.followUpDays) : undefined,
      createdAt: subHours(now, d.hoursAgo),
      updatedAt: subHours(now, d.hoursAgo),
    }));
    await Discussion.collection.insertMany(discussionDocs);

    console.log(
      `[seed] ${seedLead.name.padEnd(16)} status=${seedLead.status.padEnd(14)} discussions=${seedLead.discussions.length}`,
    );
  }

  console.log(`[seed] inserted ${seedLeads.length} leads`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
