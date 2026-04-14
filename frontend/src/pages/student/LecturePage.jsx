import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, Play, FileText, ClipboardList, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const typeIcon = { VIDEO: Play, DOCUMENT: FileText, QUIZ: ClipboardList };
const typeColor = { VIDEO: 'text-blue-500', DOCUMENT: 'text-orange-500', QUIZ: 'text-purple-500' };

export default function StudentLecturePage() {
  const { lectureId } = useParams();
  const [lectures, setLectures] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/learning/classes/${lectureId}/lectures`).then(r => {
      const data = r.data.data || [];
      setLectures(data);
      if (data[0]) setSelected(data[0]);
    }).finally(() => setLoading(false));
  }, [lectureId]);

  if (loading) return <div className="text-gray-500 text-sm p-6">Đang tải...</div>;

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* Sidebar bài giảng */}
      <div className="w-72 bg-white rounded-xl border border-gray-100 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm text-gray-900">Nội dung bài học</h2>
        </div>
        {lectures.map((lecture) => (
          <div key={lecture.id}>
            <button
              onClick={() => setSelected(lecture)}
              className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-gray-50 transition-colors ${
                selected?.id === lecture.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
              }`}
            >
              <span>{lecture.title}</span>
              <ChevronRight size={15} />
            </button>
            {selected?.id === lecture.id && lecture.modules?.map((mod) => (
              <div key={mod.id} className="bg-gray-50">
                <p className="px-5 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">{mod.title}</p>
                {mod.contents?.map((content) => {
                  const Icon = typeIcon[content.type] || FileText;
                  return (
                    <div key={content.id} className="flex items-center gap-2.5 px-5 py-2.5 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer">
                      <Icon size={13} className={typeColor[content.type]} />
                      <span className="flex-1">{content.title}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Nội dung chính */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6 overflow-y-auto">
        {selected ? (
          <>
            <h1 className="text-lg font-bold text-gray-900 mb-2">{selected.title}</h1>
            {selected.description && <p className="text-sm text-gray-500 mb-6">{selected.description}</p>}
            <p className="text-sm text-gray-400">Chọn nội dung bên trái để bắt đầu học.</p>
          </>
        ) : (
          <p className="text-gray-400 text-sm">Chọn bài giảng để bắt đầu.</p>
        )}
      </div>
    </div>
  );
}
