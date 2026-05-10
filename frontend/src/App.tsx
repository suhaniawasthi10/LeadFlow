import { ArrowUpRight, Plus } from 'lucide-react';
import { LeadList } from '@/features/leads/LeadList';

function App() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-1.5">
            <ArrowUpRight className="size-4 text-indigo-600" />
            <span className="text-base font-semibold text-gray-900">LeadFlow</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="size-4" />
            Add New Lead
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 pt-12 pb-24">
        <LeadList />
      </main>
    </div>
  );
}

export default App;
