'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Salaries',
  'Rent',
  'Utilities',
  'Packaging',
  'Ingredients',
  'Marketing',
  'Other',
];

export default function AdminExpensesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    category: 'Other',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createExpense = useMutation({
    mutationFn: async (data: typeof form) => {
      const { error } = await supabase.from('expenses').insert({
        title: data.title,
        category: data.category,
        amount: parseFloat(data.amount),
        date: data.date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setForm({
        title: '',
        category: 'Other',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const total = expenses?.reduce((s, e) => s + (e.amount || 0), 0) || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Expenses</h1>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
        <h2 className="font-semibold mb-4">Add Expense</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="px-4 py-2 rounded-xl border"
          />
          <button
            onClick={() => createExpense.mutate(form)}
            disabled={!form.title || !form.amount}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between">
          <span className="font-bold">Total Expenses</span>
          <span className="text-primary font-bold">Rs {total}/-</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses?.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-4">{format(new Date(e.date), 'MMM d, yyyy')}</td>
                  <td className="p-4 font-medium">{e.title}</td>
                  <td className="p-4 text-gray-800">{e.category}</td>
                  <td className="p-4">Rs {e.amount}/-</td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteExpense.mutate(e.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!expenses?.length && !isLoading && (
          <div className="p-12 text-center text-gray-800">No expenses yet.</div>
        )}
      </div>
    </div>
  );
}
