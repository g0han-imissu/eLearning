import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function QuizStats({ results, total }) {
  const correct = results.filter((r) => r.scorePercent === 100).length;
  const wrong = results.length - correct;

  const data = [
    { name: 'Đúng hết', value: correct, color: '#34d399' },
    { name: 'Sai/thiếu', value: wrong, color: '#f87171' },
    { name: 'Chưa nộp', value: Math.max(0, total - results.length), color: '#475569' },
  ].filter((d) => d.value > 0);

  const submitPct = total > 0 ? Math.round((results.length / total) * 100) : 0;

  return (
    <div className="bg-white/5 rounded-2xl ring-1 ring-white/10 p-3.5 space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-slate-300">Kết quả</h3>
          <span className="text-[11px] font-medium text-slate-400">{results.length}/{total} đã nộp</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${submitPct}%` }} />
        </div>
      </div>

      {data.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={55} paddingAngle={3} stroke="none">
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, fontSize: 12 }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {data.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                {d.name}: <span className="font-semibold text-white">{d.value}</span>
              </span>
            ))}
          </div>
        </>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {results.map((r, i) => (
          <div key={i} className="bg-white/5 ring-1 ring-white/5 rounded-xl p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white truncate max-w-[120px]">
                {r.name || `Học sinh ${i + 1}`}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                r.scorePercent === 100 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
              }`}>
                {r.scorePercent}%
              </span>
            </div>
            {r.answers && (
              <div className="flex flex-wrap gap-1">
                {r.answers.map((a, ai) => (
                  <span
                    key={ai}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                      a.isCorrect ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                    }`}
                  >
                    Q{ai + 1} {a.isCorrect ? '✓' : '✗'}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
