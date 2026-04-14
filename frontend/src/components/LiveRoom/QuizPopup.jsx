import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';

// Học sinh nhận được khi giảng viên phát quiz
export default function QuizPopup({ quiz, onSubmit }) {
  const [selected, setSelected] = useState({}); // { questionIndex: answerIndex }
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitSec || 30);
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
    quiz.questions.forEach((q, qi) => {
      const ai = selected[qi];
      if (ai !== undefined && q.answers[ai]?.isCorrect) correct++;
    });
    const pct = Math.round((correct / quiz.questions.length) * 100);
    setScore(pct);
    setSubmitted(true);
    onSubmit({ correct, total: quiz.questions.length, scorePercent: pct });
  };

  const timerColor = timeLeft <= 5 ? 'text-red-500' : timeLeft <= 10 ? 'text-orange-500' : 'text-indigo-600';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-600 font-medium">Quiz từ giảng viên</p>
            <h2 className="font-bold text-gray-900">{quiz.title}</h2>
          </div>
          {!submitted && (
            <div className={`flex items-center gap-1.5 font-bold text-lg ${timerColor}`}>
              <Clock size={18} />{timeLeft}s
            </div>
          )}
        </div>

        {submitted ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
            <p className="text-2xl font-bold text-gray-900 mb-1">{score}%</p>
            <p className="text-gray-500 text-sm">Đã nộp bài thành công</p>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-5">
            {quiz.questions.map((q, qi) => (
              <div key={qi}>
                <p className="text-sm font-medium text-gray-800 mb-2.5">
                  <span className="text-indigo-600 mr-1">Q{qi + 1}.</span>{q.content}
                </p>
                <div className="space-y-2">
                  {q.answers.map((a, ai) => (
                    <button
                      key={ai}
                      onClick={() => setSelected({ ...selected, [qi]: ai })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border-2 transition-all ${
                        selected[qi] === ai
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="font-medium mr-2 text-gray-400">{String.fromCharCode(65 + ai)}.</span>
                      {a.content}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-3 text-sm mt-2 transition-colors"
            >
              Nộp bài
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
