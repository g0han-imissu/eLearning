import { useState } from 'react';
import { Plus, Trash2, Send, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900">Tạo Quiz Live</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề quiz</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Kiểm tra nhanh chương 1"
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-600 mb-1">Thời gian (giây)</label>
              <input
                type="number"
                value={timeLimitSec}
                onChange={e => setTimeLimitSec(Number(e.target.value))}
                min={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-indigo-600 mt-2.5 w-5 flex-shrink-0">Q{qi + 1}</span>
                <input
                  value={q.content}
                  onChange={e => updateQuestion(qi, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nội dung câu hỏi..."
                />
                {questions.length > 1 && (
                  <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 mt-2">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-2 pl-7">
                {q.answers.map((a, ai) => (
                  <div key={ai} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={a.isCorrect}
                      onChange={() => updateAnswer(qi, ai, 'isCorrect', true)}
                      className="accent-green-500"
                      title="Đánh dấu đáp án đúng"
                    />
                    <input
                      value={a.content}
                      onChange={e => updateAnswer(qi, ai, 'content', e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Đáp án ${ai + 1}`}
                    />
                    {q.answers.length > 2 && (
                      <button onClick={() => removeAnswer(qi, ai)} className="text-red-400 hover:text-red-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addAnswer(qi)} className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                  <Plus size={12} /> Thêm đáp án
                </button>
              </div>
            </div>
          ))}

          <button onClick={addQuestion} className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 flex items-center justify-center gap-2 transition-colors">
            <Plus size={16} /> Thêm câu hỏi
          </button>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Huỷ</button>
          <button
            onClick={handleLaunch}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <Send size={15} /> Phát cho học sinh
          </button>
        </div>
      </div>
    </div>
  );
}
