import { useState } from 'react';
import { Plus, Trash2, Send, X, ClipboardList } from 'lucide-react';

// Giảng viên dùng: tạo quiz nhanh và phát cho học sinh trong phòng
export default function QuizLauncher({ onLaunch, onClose }) {
  const [title, setTitle] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState(30);
  const [questions, setQuestions] = useState([
    { content: '', answers: [{ content: '', isCorrect: false }, { content: '', isCorrect: false }] },
  ]);

  const addQuestion = () => setQuestions([...questions, {
    content: '', answers: [{ content: '', isCorrect: false }, { content: '', isCorrect: false }],
  }]);

  const removeQuestion = (qi) => setQuestions(questions.filter((_, i) => i !== qi));

  const updateQuestion = (qi, content) => setQuestions(questions.map((q, i) => i === qi ? { ...q, content } : q));

  const addAnswer = (qi) => setQuestions(questions.map((q, i) =>
    i === qi ? { ...q, answers: [...q.answers, { content: '', isCorrect: false }] } : q
  ));

  const updateAnswer = (qi, ai, field, value) => setQuestions(questions.map((q, i) => {
    if (i !== qi) return q;
    const answers = q.answers.map((a, j) => {
      if (j !== ai) return field === 'isCorrect' ? { ...a, isCorrect: false } : a;
      return { ...a, [field]: value };
    });
    return { ...q, answers };
  }));

  const removeAnswer = (qi, ai) => setQuestions(questions.map((q, i) =>
    i === qi ? { ...q, answers: q.answers.filter((_, j) => j !== ai) } : q
  ));

  const handleLaunch = () => {
    if (!title.trim()) return alert('Nhập tiêu đề quiz');
    if (questions.some(q => !q.content.trim())) return alert('Điền nội dung câu hỏi');
    onLaunch({ title, timeLimitSec, questions });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-overlay">
      <div className="bg-slate-900/95 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl max-h-[90vh] flex flex-col animate-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ClipboardList size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-white">Tạo Quiz Live</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tiêu đề quiz</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="glass-input"
                placeholder="Kiểm tra nhanh chương 1"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Thời gian (giây)</label>
              <input
                type="number"
                value={timeLimitSec}
                onChange={e => setTimeLimitSec(Number(e.target.value))}
                min={10}
                className="glass-input"
              />
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="bg-white/[0.03] ring-1 ring-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-bold text-indigo-300 bg-indigo-500/15 rounded-lg w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0">Q{qi + 1}</span>
                <input
                  value={q.content}
                  onChange={e => updateQuestion(qi, e.target.value)}
                  className="glass-input"
                  placeholder="Nội dung câu hỏi..."
                />
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-300 mt-2.5 flex-shrink-0" title="Xoá câu hỏi">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-2 pl-10">
                {q.answers.map((a, ai) => (
                  <div key={ai} className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={a.isCorrect}
                      onChange={() => updateAnswer(qi, ai, 'isCorrect', true)}
                      className="accent-emerald-500 flex-shrink-0"
                      title="Đánh dấu đáp án đúng"
                    />
                    <input
                      value={a.content}
                      onChange={e => updateAnswer(qi, ai, 'content', e.target.value)}
                      className="glass-input !py-2"
                      placeholder={`Đáp án ${ai + 1}`}
                    />
                    {q.answers.length > 2 && (
                      <button onClick={() => removeAnswer(qi, ai)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addAnswer(qi)} className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-medium transition-colors">
                  <Plus size={12} /> Thêm đáp án
                </button>
              </div>
            </div>
          ))}

          <button onClick={addQuestion} className="w-full border-2 border-dashed border-white/15 rounded-xl py-3 text-sm text-slate-400 hover:border-indigo-400/50 hover:text-indigo-300 hover:bg-indigo-500/5 flex items-center justify-center gap-2 transition-all">
            <Plus size={16} /> Thêm câu hỏi
          </button>
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors">Huỷ</button>
          <button
            onClick={handleLaunch}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Send size={15} /> Phát cho học sinh
          </button>
        </div>
      </div>
    </div>
  );
}
