import { useEffect, useState } from 'react';
import { Download, Undo2, KeyRound, X } from 'lucide-react';
import { getImportJobs, rollbackImportJob, wipeImportCredentials, downloadImportCredentials } from '../../api/users.api';
import Modal from '../ui/Modal';
import Confirm from '../ui/Confirm';
import Badge from '../ui/Badge';
import { Button } from '../ui/FormField';

const statusVariant = {
  COMPLETED: 'green', COMPLETED_WITH_ERRORS: 'yellow',
  PROCESSING: 'yellow', FAILED: 'red', ROLLED_BACK: 'red',
};
const statusLabel = {
  COMPLETED: 'Hoàn tất', COMPLETED_WITH_ERRORS: 'Có lỗi',
  PROCESSING: 'Đang xử lý', FAILED: 'Thất bại', ROLLED_BACK: 'Đã hoàn tác',
};

export default function ImportJobsModal({ onClose, onChanged }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rollbackTarget, setRollbackTarget] = useState(null);
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    getImportJobs().then(r => setJobs(r.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRollback = async () => {
    try {
      const res = await rollbackImportJob(rollbackTarget.id);
      setNotice(res.data.message);
      onChanged?.();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Hoàn tác thất bại');
    }
    setRollbackTarget(null);
    load();
  };

  const handleWipe = async (job) => {
    try {
      const res = await wipeImportCredentials(job.id);
      setNotice(res.data.message);
    } catch (err) {
      setNotice(err.response?.data?.message || 'Thu hồi thất bại');
    }
    load();
  };

  const handleDownload = async (job) => {
    try {
      await downloadImportCredentials(job.id);
    } catch {
      setNotice('Không còn mật khẩu tạm nào trong job này (đã thu hồi hoặc người dùng đã đổi mật khẩu).');
    }
  };

  return (
    <Modal title="Lịch sử import" subtitle="Tải danh sách tài khoản, thu hồi mật khẩu tạm hoặc hoàn tác" onClose={onClose} size="xl">
      {notice && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 rounded-xl px-4 py-2.5 mb-4 text-sm flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-indigo-300 hover:text-white"><X size={14} /></button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/10">
              {['Thời gian', 'Loại', 'Nguồn', 'Kết quả', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">Đang tải...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500">Chưa có lần import nào</td></tr>
            ) : jobs.map(job => (
              <tr key={job.id} className="hover:bg-white/5">
                <td className="px-3 py-2.5 text-slate-300 text-xs">
                  {new Date(job.createdAt).toLocaleString('vi-VN')}
                  <p className="text-slate-500">{job.createdBy?.fullName}</p>
                </td>
                <td className="px-3 py-2.5 text-slate-300">{job.type === 'TEACHER' ? 'Giảng viên' : 'Học viên'}</td>
                <td className="px-3 py-2.5 text-slate-400 text-xs">{job.source === 'MANUAL' ? 'Thủ công' : job.fileName || job.source}</td>
                <td className="px-3 py-2.5 text-slate-300 text-xs">
                  {job.successCount}/{job.totalRows} thành công
                  {job.errorCount > 0 && <span className="text-amber-300"> · {job.errorCount} lỗi</span>}
                </td>
                <td className="px-3 py-2.5"><Badge variant={statusVariant[job.status]}>{statusLabel[job.status]}</Badge></td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDownload(job)}
                      title="Tải danh sách tài khoản + mật khẩu tạm"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      onClick={() => handleWipe(job)}
                      title="Thu hồi mật khẩu tạm"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <KeyRound size={15} />
                    </button>
                    {job.status !== 'ROLLED_BACK' && (
                      <button
                        onClick={() => setRollbackTarget(job)}
                        title="Hoàn tác import (xóa các tài khoản chưa hoạt động)"
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        <Undo2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rollbackTarget && (
        <Confirm
          message={`Hoàn tác lần import này? Các tài khoản đã tạo mà CHƯA từng đăng nhập/đổi mật khẩu sẽ bị xóa vĩnh viễn.`}
          onConfirm={handleRollback}
          onCancel={() => setRollbackTarget(null)}
        />
      )}
    </Modal>
  );
}
