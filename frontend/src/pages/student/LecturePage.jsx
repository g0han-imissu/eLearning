import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, Play, FileText, ClipboardList, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import { submitQuiz } from '../../api/student.api';

const typeIcon = { VIDEO: Play, DOCUMENT: FileText, QUIZ: ClipboardList };
const typeColor = { VIDEO: 'bg-blue-100 text-blue-600', DOCUMENT: 'bg-orange-100 text-orange-600', QUIZ: 'bg-purple-100 text-purple-600' };

function VideoPlayer({ content }) {
  return (
    <div className="bg-black rounded-xl overflow-hidden aspect-video">
      <video src={content.video?.videoUrl} controls className="w-full h-full" />
    </div>
  );
}

function DocumentViewer({ content }) {
  const url = content.document?.fileUrl;
  const isPdf = content.document?.fileType?.includes('pdf') || url?.endsWith('.pdf');
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{content.title}</h3>
        <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
          <ExternalLink size={14} /> Mở trong tab mới
        </a>
      </div>
      {isPdf ? (
        <iframe src={url} className="w-full h-[600px] rounded-lg border" title={content.title} />
      ) : (
        <div className="text-center py-12 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nhấn "Mở trong tab mới" để xem tài liệu</p>
        </div>
      )}
    </div>
  );
}

function QuizTaker({ content, classId }) {
  const quiz = content.quiz;
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  if (!quiz) return <p className="text-gray-400 text-sm p-6">Quiz chưa có câu hỏi.</p>;

  const handleSubmit = async () => {
    const answers = quiz.questions.map((q, qi) => ({
      questionId: q.id,
      answerId: q.answers[selected[qi]]?.id,
    })).filter(a => a.answerId);

    try {
      const res = await submitQuiz({ quizId: quiz.id, classId, answers });
      setResult(res.data);
    } catch {
      // fallback local scoring
      let correct = 0;
      quiz.questions.forEach((q, qi) => {
        if (selected[qi] !== undefined && q.answers[selected[qi]]?.isCorrect) correct++;
      });
      setResult({ scorePercent: Math.round(correct / quiz.questions.length * 100), passed: correct / quiz.questions.length >= 0.5 });
    }
    setSubmitted(true);
  };

  if (submitted && result) return (
    <div className="bg-white rounded-xl border p-8 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
        <span className={`text-2xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>{result.scorePercent}%</span>
      </div>
      <p className={`font-bold text-lg ${result.passed ? 'text-green-700' : 'text-red-700'}`}>{result.passed ? 'Đạt!' : 'Chưa đạt'}</p>
      <button onClick={() => { setSubmitted(false); setSelected({}); setResult(null); }}
        className="mt-4 text-sm text-indigo-600 hover:underline">Làm lại</button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border p-6 space-y-5">
      <h3 className="font-bold text-gray-900">{quiz.title}</h3>
      {quiz.questions?.map((q, qi) => (
        <div key={q.id}>
          <p className="text-sm font-medium text-gray-800 mb-2.5">
            <span className="text-indigo-600 mr-1">Q{qi + 1}.</span>{q.content}
          </p>
          <div className="space-y-2">
            {q.answers?.map((a, ai) => (
              <button key={a.id} onClick={() => setSelected({ ...selected, [qi]: ai })}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border-2 transition-all ${selected[qi] === ai ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-medium' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className="font-medium mr-2 text-gray-400">{String.fromCharCode(65 + ai)}.</span>{a.content}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit}
        disabled={Object.keys(selected).length < (quiz.questions?.length || 0)}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors">
        Nộp bài
      </button>
    </div>
  );
}

export default function StudentLecturePage() {
  const { classId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/learning/classes/${classId}`).then(r => {
      const cls = r.data;
      return api.get('/content/lectures', { params: { courseId: cls.courseId } });
    }).then(r => {
      const data = r.data.data || [];
      setLectures(data);
      if (data[0]) setSelectedLecture(data[0]);
    }).finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <div className="p-6 text-gray-400 text-sm">Đang tải...</div>;

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <div className="w-72 bg-white rounded-xl border border-gray-100 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b"><h2 className="font-semibold text-sm text-gray-900">Nội dung học</h2></div>
        {lectures.map(lec => (
          <div key={lec.id}>
            <button onClick={() => setSelectedLecture(lec)}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-gray-50 ${selectedLecture?.id === lec.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}>
              <span>{lec.title}</span><ChevronRight size={14} />
            </button>
            {selectedLecture?.id === lec.id && lec.modules?.map(mod => (
              <div key={mod.id} className="bg-gray-50">
                <p className="px-5 py-1.5 text-xs font-medium text-gray-500 uppercase">{mod.title}</p>
                {mod.contents?.map(c => {
                  const Icon = typeIcon[c.type] || FileText;
                  const done = selectedContent?.id === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelectedContent(c)}
                      className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs hover:bg-gray-100 transition-colors ${done ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}>
                      <span className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${done ? 'bg-indigo-100' : 'bg-white border'}`}>
                        <Icon size={11} className={done ? 'text-indigo-600' : 'text-gray-400'} />
                      </span>
                      <span className="flex-1 text-left">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {selectedContent ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColor[selectedContent.type]}`}>{selectedContent.type}</span>
              <h2 className="font-bold text-gray-900">{selectedContent.title}</h2>
            </div>
            {selectedContent.type === 'VIDEO' && <VideoPlayer content={selectedContent} />}
            {selectedContent.type === 'DOCUMENT' && <DocumentViewer content={selectedContent} />}
            {selectedContent.type === 'QUIZ' && <QuizTaker content={selectedContent} classId={classId} />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <Play size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Chọn nội dung bên trái để bắt đầu học</p>
          </div>
        )}
      </div>
    </div>
  );
}
