import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, Calendar } from 'lucide-react';
import api from '../../api/axios';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/teacher/classes').then(r => setClasses(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500 text-sm">Đang tải...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Lớp học của tôi</h1>
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">Chưa có lớp học nào.</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-indigo-600 font-medium mb-1">{cls.code}</p>
                  <h3 className="font-semibold text-gray-900 text-sm">{cls.title}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  cls.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>{cls.status}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><Users size={13} />{cls._count?.enrollments ?? 0} học viên</span>
                {cls.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />{new Date(cls.startDate).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
              <button
                onClick={() => navigate(`/teacher/live/${cls.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg py-2 transition-colors"
              >
                <Video size={14} /> Vào phòng dạy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
