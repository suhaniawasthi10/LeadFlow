import { useState } from 'react';
import { ArrowUpRight, LogOut, Plus } from 'lucide-react';
import { LeadList } from '@/features/leads/LeadList';
import { AddLeadDialog } from '@/features/leads/AddLeadDialog';
import { TimelineDialog } from '@/features/leads/TimelineDialog';
import { AuthPage } from '@/features/auth/AuthPage';
import { useAuth } from '@/contexts/AuthContext';

function App() {
  const { user, isLoading, logout } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa]">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="size-4 text-indigo-600" />
            <span className="text-base font-semibold text-gray-900">LeadFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-500 sm:block">{user.email}</span>
            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <Plus className="size-4" />
              Add New Lead
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 pt-6 pb-24">
        <LeadList
          onLeadClick={(lead) => setActiveLeadId(lead._id)}
          onAddLead={() => setIsAddOpen(true)}
        />
      </main>

      <AddLeadDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <TimelineDialog
        leadId={activeLeadId}
        onClose={() => setActiveLeadId(null)}
      />
    </div>
  );
}

export default App;
