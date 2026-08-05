// src/components/company/ExpenseTable.jsx — Relocation Expense Tracker Table Component
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ExpenseTable({ expenses = [], summary = {}, onLogExpense, onDeleteExpense }) {
  const totalExp = summary.total_expenses || expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const categories = summary.category_breakdown || {};

  return (
    <div className="space-y-6">
      {/* Category Breakdown Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {['Housing', 'Broker Fee', 'Transportation', 'Temporary Stay', 'Documentation', 'Miscellaneous'].map((cat) => (
          <Card key={cat} className="p-3 bg-white border border-[#D9D9D9] text-center">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase truncate">{cat}</span>
            <span className="text-sm font-bold text-[#222831]">
              ₹{(categories[cat] || 0).toLocaleString()}
            </span>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-[#222831]">Relocation Expense Ledger</h3>
          <p className="text-xs text-[#393E46]">
            Total Expenses Recorded: <strong className="text-[#00ADB5] font-extrabold">₹{totalExp.toLocaleString()}</strong>
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onLogExpense}>
          + Log Relocation Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card className="text-center py-12 text-xs text-[#393E46]/70">
          No relocation expenses logged yet. Click "+ Log Relocation Expense" to record costs.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-[#D9D9D9] bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#EEEEEE] text-[10px] font-bold text-[#393E46] uppercase border-b border-[#D9D9D9]">
                <th className="p-4">Employee ID</th>
                <th className="p-4">Expense Category</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9] font-semibold text-[#222831]">
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-[#EEEEEE]/30 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-gray-600">{exp.employee_id || 'General'}</td>
                  <td className="p-4 font-bold text-[#00ADB5]">{exp.category}</td>
                  <td className="p-4 font-bold text-green-600 tabular-nums">₹{exp.amount?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase bg-green-100 text-green-700 border-green-200">
                      {exp.status || 'approved'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 font-normal truncate max-w-xs">{exp.notes || '—'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onDeleteExpense(exp._id)}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
