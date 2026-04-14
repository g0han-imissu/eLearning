import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Giảng viên xem live stats khi học sinh nộp
export default function QuizStats({ results, total }) {
  const correct = results.filter(r => r.scorePercent === 100).length;
  const wrong = results.length - correct;

  const data = [
    { name: 'Đúng', value: correct },
    { name: 'Sai', value: wrong },
    { name: 'Chưa nộp', value: Math.max(0, total - results.length) },
  ].filter(d => d.value > 0);

  const COLORS = ['#22c55e', '#ef4444', '#d1d5db'];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Kết quả ({results.length}/{total} đã nộp)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={65} label={({ name, value }) => `${name}: ${value}`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 space-y-1">
        {results.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs text-gray-600">
            <span>Học sinh {i + 1}</span>
            <span className={`font-medium ${r.scorePercent === 100 ? 'text-green-600' : 'text-red-500'}`}>
              {r.scorePercent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
