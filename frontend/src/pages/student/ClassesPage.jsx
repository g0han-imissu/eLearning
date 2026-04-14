import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, BarChart2 } from 'lucide-react';
import api from '../../api/axios';

export default function StudentClassesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/student/enrollments').then(r => setEnrollments(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 text-sm">Đang tải...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Lớp học của tôi</h1>
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Chưa được ghi danh lớp nào.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {enrollments.map((enr) => (
            <div key={enr.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <p className="text-xs text-indigo-600 font-medium mb-1">{enr.class?.code}</p>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{enr.class?.title}</h3>
              <p className="text-xs text-gray-500 mb-3">{enr.class?.course?.title}</p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tiến độ</span><span>{Number(enr.progress)}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${enr.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/student/lecture/${enr.classId}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg py-2 transition-colors"
                >
                  <BookOpen size={13} /> Học bài
                </button>
                <button
                  onClick={() => navigate(`/student/live/${enr.classId}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg py-2 transition-colors"
                >
                  <Video size={13} /> Vào lớp live
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
