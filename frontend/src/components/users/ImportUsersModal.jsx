import { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { importUsers, downloadImportTemplate, downloadImportCredentials } from '../../api/users.api';
import Modal from '../ui/Modal';
import { Select, Button } from '../ui/FormField';

export default function ImportUsersModal({ onClose, onImported }) {
  const [type, setType] = useState('STUDENT');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(null); // kết quả dryRun
  const [result, setResult] = useState(null);   // kết quả import thật

  const pickFile = (f) => {
    setFile(f);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const handleCheck = async () => {
    if (!file) return setError('Chưa chọn file');
    setChecking(true);
    setError('');
    try {
      const res = await importUsers(file, { type, dryRun: true });
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Kiểm tra file thất bại');
    } finally {
      setChecking(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');
    try {
      const res = await importUsers(file, { type });
      setResult(res.data);
      onImported?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Import thất bại');
    } finally {
      setImporting(false);
    }
  };

  if (result) {
    return (
      <Modal title="Kết quả import" onClose={onClose} size="md">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {result.errorCount === 0
              ? <CheckCircle size={22} className="text-emerald-300" />
              : <AlertTriangle size={22} className="text-amber-300" />}
            <p className="text-sm text-slate-200">
              Tạo thành công <strong className="text-white">{result.successCount}</strong>/{result.totalRows} tài khoản
              {result.errorCount > 0 && <> — <span className="text-amber-300">{result.errorCount} dòng lỗi</span></>}
            </p>
          </div>

          {result.emailInviteCount > 0 && (
            <p className="text-sm text-slate-400">
              📧 Đã gửi {result.emailInviteCount - result.emailFailedCount}/{result.emailInviteCount} email mời kích hoạt.
              {result.emailFailedCount > 0 && <span className="text-red-300"> {result.emailFailedCount} email gửi thất bại — xem chi tiết trong lịch sử import.</span>}
            </p>
          )}

          {result.credentialCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
              <p className="text-sm text-amber-200 flex items-center gap-2">
                <KeyRound size={15} />
                {result.credentialCount} tài khoản không có email — tải danh sách mật khẩu tạm để phát cho người dùng.
              </p>
              <Button size="sm" onClick={() => downloadImportCredentials(result.jobId)}>
                <Download size={14} /> Tải danh sách tài khoản (CSV)
              </Button>
              <p className="text-[11px] text-slate-400">
                File chứa mật khẩu — phát xong hãy thu hồi trong Lịch sử import. Mật khẩu tự bị thu hồi khi người dùng đổi mật khẩu lần đầu.
              </p>
            </div>
          )}

          {result.errorCount > 0 && result.rows && (
            <div className="max-h-44 overflow-y-auto rounded-xl border border-white/10">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-white/10">
                  {result.rows.filter(r => r.status === 'ERROR').map(r => (
                    <tr key={r.rowNumber}>
                      <td className="px-3 py-2 text-slate-400 w-16">Dòng {r.rowNumber}</td>
                      <td className="px-3 py-2 text-red-300">{r.errorMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>Đóng</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Import người dùng" subtitle="Hỗ trợ file CSV hoặc Excel (.xlsx) — tối đa 2000 dòng" onClose={onClose} size="lg">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Loại người dùng</label>
            <Select value={type} onChange={(e) => { setType(e.target.value); setPreview(null); }}>
              <option value="STUDENT">Học viên</option>
              <option value="TEACHER">Giảng viên</option>
            </Select>
          </div>
          <Button variant="outline" onClick={() => downloadImportTemplate(type)}>
            <Download size={15} /> Tải file mẫu
          </Button>
        </div>

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 hover:border-indigo-400/50 rounded-2xl py-8 cursor-pointer transition-colors bg-white/[0.03]">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <>
              <FileSpreadsheet size={28} className="text-emerald-300" />
              <p className="text-sm font-semibold text-white">{file.name}</p>
              <p className="text-xs text-slate-500">Bấm để chọn file khác</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-slate-500" />
              <p className="text-sm text-slate-300">Bấm để chọn file CSV / Excel</p>
              <p className="text-xs text-slate-500">Cột: mã, họ tên, email (tuỳ chọn), SĐT{type === 'STUDENT' ? ', chương trình, lớp' : ', khoa'}</p>
            </>
          )}
        </label>

        {preview && (
          <div className={`rounded-xl border p-4 space-y-2 ${preview.errorRows === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <p className="text-sm text-slate-200">
              Kiểm tra: <strong className="text-white">{preview.validRows}</strong>/{preview.totalRows} dòng hợp lệ
              {preview.errorRows > 0 && <span className="text-amber-300"> — {preview.errorRows} dòng lỗi (sẽ bị bỏ qua khi import)</span>}
            </p>
            {preview.errors.length > 0 && (
              <div className="max-h-36 overflow-y-auto text-xs space-y-1">
                {preview.errors.map((e, i) => (
                  <p key={i} className="text-amber-200">Dòng {e.row} — {e.field}: {e.message}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button variant="outline" onClick={handleCheck} disabled={!file || checking}>
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra file'}
          </Button>
          <Button onClick={handleImport} disabled={!file || importing || (preview && preview.validRows === 0)}>
            <Upload size={15} /> {importing ? 'Đang import...' : 'Import'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
