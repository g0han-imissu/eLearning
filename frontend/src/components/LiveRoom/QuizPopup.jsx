import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Sparkles } from 'lucide-react';

// Học sinh nhận được khi giảng viên phát quiz
export default function QuizPopup({ quiz, onSubmit }) {
  const [selected, setSelected] = useState({}); // { questionIndex: answerIndex }
  const [submitted, setSubmitted] = useState(false);
  const timeLimit = quiz.timeLimitSec || 30;
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) { clearInterval(t); handleSubmit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const handleSubmit = () => {
    if (submitted) return;
    let correct = 0;
    const answers = quiz.questions.map((q, qi) => {
      const ai = selected[qi];
      const isCorrect = ai !== undefined && !!q.answers[ai]?.isCorrect;
      if (isCorrect) correct++;
      return { questionIndex: qi, selectedIndex: ai ?? null, isCorrect };
    });
    const pct = Math.round((correct / quiz.questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onSubmit({ correct, total: quiz.questions.length, scorePercent: pct, answers });
  };

  const timerColor = timeLeft <= 5 ? 'text-red-300 bg-red-500/15 ring-red-500/30' : timeLeft <= 10 ? 'text-amber-300 bg-amber-500/15 ring-amber-500/30' : 'text-indigo-300 bg-indigo-500/15 ring-indigo-500/30';
  const timerBar = timeLeft <= 5 ? 'from-red-500 to-rose-500' : timeLeft <= 10 ? 'from-amber-500 to-orange-500' : 'from-indigo-500 to-violet-500';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-overlay">
      <div className="bg-slate-900/95 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modal">
        {/* Thanh thời gian còn lại */}
        {!submitted && (
          <div className="h-1 bg-white/5">
            <div
              className={`h-full bg-gradient-to-r ${timerBar} transition-all duration-1000 ease-linear`}
              style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
            />
          </div>
        )}

        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">
              <Sparkles size={12} /> Quiz từ giảng viên
            </p>
            <h2 className="font-bold text-white truncate mt-0.5">{quiz.title}</h2>
          </div>
          {!submitted && (
            <div className={`flex items-center gap-1.5 font-bold text-sm px-3 py-1.5 rounded-full ring-1 flex-shrink-0 ${timerColor}`}>
              <Clock size={15} />{timeLeft}s
            </div>
          )}
        </div>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-emerald-300" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{score}%</p>
            <p className="text-slate-400 text-sm">Đã nộp bài thành công</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">
            {quiz.questions.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-medium text-slate-100 mb-2.5">
                  <span className="text-indigo-300 font-bold mr-1.5">Q{qi + 1}.</span>{q.content}
                </p>
                <div className="space-y-2">
                  {q.answers.map((a, ai) => (
                    <button
                      key={ai}
                      onClick={() => setSelected({ ...selected, [qi]: ai })}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm ring-1 transition-all ${
                        selected[qi] === ai
                          ? 'ring-indigo-500 bg-indigo-500/15 text-indigo-100 font-medium'
                          : 'ring-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:ring-white/20 text-slate-200'
                      }`}
                    >
                      <span className={`font-semibold mr-2 ${selected[qi] === ai ? 'text-indigo-300' : 'text-slate-500'}`}>
                        {String.fromCharCode(65 + ai)}.
                      </span>
                      {a.content}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              Nộp bài
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
