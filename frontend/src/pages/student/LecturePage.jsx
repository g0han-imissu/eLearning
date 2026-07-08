import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, Play, FileText, ClipboardList, ExternalLink, Download } from 'lucide-react';
import { getLectures, getContent } from '../../api/content.api';
import { submitQuiz, updateProgress } from '../../api/student.api';

const typeIcon = { VIDEO: Play, DOCUMENT: FileText, QUIZ: ClipboardList };
const typeColor = { VIDEO: 'bg-blue-500/15 text-blue-300', DOCUMENT: 'bg-orange-500/15 text-orange-300', QUIZ: 'bg-purple-500/15 text-purple-300' };

function VideoPlayer({ content, classId, onWatched }) {
  const videoRef = useRef(null);
  const reported = useRef(false);

  const handleTimeUpdate = () => {
    if (reported.current) return;
    const v = videoRef.current;
    if (v && v.duration > 0 && v.currentTime / v.duration > 0.8) {
      reported.current = true;
      onWatched?.();
    }
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        src={content.video?.videoUrl}
        controls
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}

function DocumentViewer({ content, onViewed }) {
  useEffect(() => { onViewed?.(); }, []);
  const url = content.document?.fileUrl;
  const isPdf = content.document?.fileType?.includes('pdf') || url?.endsWith('.pdf');
  // Cloudinary raw delivery: chèn fl_attachment để buộc tải xuống thay vì mở
  const downloadUrl = url?.includes('/upload/')
    ? url.replace('/upload/', '/upload/fl_attachment/')
    : url;
  return (
    <div className="glass p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-white">{content.title}</h3>
        <div className="flex items-center gap-3">
          <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300">
            <ExternalLink size={14} />Mở tab mới
          </a>
          <a href={downloadUrl} download className="flex items-center gap-1.5 text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white px-3 py-1.5 rounded-lg transition-colors">
            <Download size={14} />Tải xuống
          </a>
        </div>
      </div>
      {isPdf ? (
        <iframe src={url} className="w-full h-[600px] rounded-xl ring-1 ring-white/10" title={content.title} />
      ) : (
        <div className="text-center py-12 text-slate-500">
          <FileText size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nhấn "Tải xuống" để lưu tài liệu về máy</p>
        </div>
      )}
    </div>
  );
}

function QuizTaker({ content, classId, onCompleted }) {
  const quiz = content.quiz;
  const [selected, setSelected] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  if (!quiz) return <p className="text-slate-500 text-sm p-6">Quiz chưa có câu hỏi.</p>;

  const handleSubmit = async () => {
    const answers = quiz.questions.map((q, qi) => ({
      questionId: q.id,
      answerId: q.answers[selected[qi]]?.id,
    })).filter(a => a.answerId);

    try {
      const res = await submitQuiz({ quizId: quiz.id, classId, answers });
      setResult(res.data);
      onCompleted?.();
    } catch {
      let correct = 0;
      quiz.questions.forEach((q, qi) => {
        if (selected[qi] !== undefined && q.answers[selected[qi]]?.isCorrect) correct++;
      });
      const scorePercent = Math.round(correct / quiz.questions.length * 100);
      setResult({ scorePercent, passed: scorePercent >= 50 });
    }
    setSubmitted(true);
  };

  if (submitted && result) return (
    <div className="glass p-8 text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
        <span className={`text-2xl font-bold ${result.passed ? 'text-emerald-300' : 'text-red-300'}`}>{result.scorePercent}%</span>
      </div>
      <p className={`font-bold text-lg ${result.passed ? 'text-emerald-300' : 'text-red-300'}`}>{result.passed ? 'Đạt!' : 'Chưa đạt'}</p>
      {result.earnedScore !== undefined && (
        <p className="text-sm text-slate-400 mt-1">{result.earnedScore}/{result.totalScore} điểm</p>
      )}
      <button onClick={() => { setSubmitted(false); setSelected({}); setResult(null); }}
        className="mt-4 text-sm text-indigo-300 hover:underline">Làm lại</button>
    </div>
  );

  return (
    <div className="glass p-6 space-y-7">
      <h3 className="font-bold text-white">{quiz.title}</h3>
      {quiz.timeLimitMin && <p className="text-xs text-slate-500">Thời gian: {quiz.timeLimitMin} phút</p>}
      {quiz.questions?.map((q, qi) => (
        <div key={q.id}>
          <p className="text-sm font-medium text-slate-100 mb-2.5">
            <span className="text-indigo-300 mr-1">Q{qi + 1}.</span>{q.content}
          </p>
          <div className="space-y-2">
            {q.answers?.map((a, ai) => (
              <button key={a.id} onClick={() => setSelected({ ...selected, [qi]: ai })}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm border-2 transition-all ${selected[qi] === ai ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200 font-medium' : 'border-white/10 hover:border-white/15'}`}>
                <span className="font-medium mr-2 text-slate-500">{String.fromCharCode(65 + ai)}.</span>{a.content}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit}
        disabled={Object.keys(selected).length < (quiz.questions?.length || 0)}
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors">
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
  const [contentDetail, setContentDetail] = useState(null); // full content with media from API
  const [contentLoading, setContentLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const totalContents = useRef(0);

  useEffect(() => {
    getLectures({ classId, limit: 100 }).then(r => {
      const data = (r.data.data || []).filter(lec => lec.isPublished);
      setLectures(data);
      if (data[0]) setSelectedLecture(data[0]);
      // count total contents for progress
      let total = 0;
      data.forEach(lec => lec.modules?.forEach(mod => { total += mod.contents?.length || 0; }));
      totalContents.current = total;
    }).finally(() => setLoading(false));
  }, [classId]);

  // When content is selected, fetch full detail (includes video/document/quiz)
  const handleSelectContent = async (c) => {
    setSelectedContent(c);
    setContentLoading(true);
    try {
      const r = await getContent(c.id);
      setContentDetail(r.data);
    } catch {
      setContentDetail(c); // fallback to existing data
    } finally { setContentLoading(false); }
  };

  const markDone = async (contentId) => {
    if (completedIds.has(contentId)) return;
    const next = new Set(completedIds);
    next.add(contentId);
    setCompletedIds(next);
    if (totalContents.current > 0) {
      const progress = Math.round((next.size / totalContents.current) * 100);
      await updateProgress({ classId, progress }).catch(() => {});
    }
  };

  if (loading) return <div className="p-6 text-slate-500 text-sm">Đang tải...</div>;

  const displayContent = contentDetail || selectedContent;

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <div className="w-72 glass-soft overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-semibold text-sm text-white">Nội dung học</h2>
          {totalContents.current > 0 && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{completedIds.size}/{totalContents.current} hoàn thành</span>
                <span>{Math.round(completedIds.size / totalContents.current * 100)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${Math.round(completedIds.size / totalContents.current * 100)}%` }} />
              </div>
            </div>
          )}
        </div>

        {lectures.map(lec => (
          <div key={lec.id}>
            <button onClick={() => setSelectedLecture(lec)}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-white/5 ${selectedLecture?.id === lec.id ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-200'}`}>
              <span className="truncate flex-1">{lec.title}</span>
              <ChevronRight size={14} className="flex-shrink-0" />
            </button>
            {selectedLecture?.id === lec.id && lec.modules?.map(mod => (
              <div key={mod.id} className="bg-white/5">
                <p className="px-5 py-1.5 text-xs font-medium text-slate-400 uppercase">{mod.title}</p>
                {mod.contents?.map(c => {
                  const Icon = typeIcon[c.type] || FileText;
                  const active = selectedContent?.id === c.id;
                  const done = completedIds.has(c.id);
                  return (
                    <button key={c.id} onClick={() => handleSelectContent(c)}
                      className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-xs hover:bg-white/10 transition-colors ${active ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-300'}`}>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500/15' : active ? 'bg-indigo-500/15' : 'bg-white/5 ring-1 ring-white/10'}`}>
                        <Icon size={11} className={done ? 'text-emerald-300' : active ? 'text-indigo-300' : 'text-slate-500'} />
                      </span>
                      <span className="flex-1 text-left truncate">{c.title}</span>
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
        {contentLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">Đang tải nội dung...</div>
        ) : displayContent ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColor[displayContent.type]}`}>{displayContent.type}</span>
              <h2 className="font-bold text-white">{displayContent.title}</h2>
            </div>
            {displayContent.type === 'VIDEO' && (
              <VideoPlayer content={displayContent} classId={classId} onWatched={() => markDone(displayContent.id)} />
            )}
            {displayContent.type === 'DOCUMENT' && (
              <DocumentViewer content={displayContent} onViewed={() => markDone(displayContent.id)} />
            )}
            {displayContent.type === 'QUIZ' && (
              <QuizTaker content={displayContent} classId={classId} onCompleted={() => markDone(displayContent.id)} />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Play size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Chọn nội dung bên trái để bắt đầu học</p>
          </div>
        )}
      </div>
    </div>
  );
}
