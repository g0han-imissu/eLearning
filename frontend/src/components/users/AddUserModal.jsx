import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Copy, Check, KeyRound, UserPlus } from 'lucide-react';
import { createUser } from '../../api/users.api';
import Modal from '../ui/Modal';
import FormField, { Input, Select, Button } from '../ui/FormField';

export default function AddUserModal({ onClose, onCreated }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { role: 'STUDENT' } });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await createUser(data);
      setResult(res.data);
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = () => {
    navigator.clipboard.writeText(`${result.credentials.username} / ${result.credentials.tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (result) {
    return (
      <Modal title="Đã tạo tài khoản" onClose={onClose} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-300">{result.message}</p>
          {result.emailFailedCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
              ⚠️ Gửi email mời thất bại — kiểm tra cấu hình EMAIL_USER/EMAIL_PASS hoặc xem chi tiết trong Lịch sử import.
            </div>
          )}
          {result.credentials && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <KeyRound size={13} /> Thông tin đăng nhập — chỉ hiển thị một lần
              </p>
              <div className="font-mono text-sm text-white space-y-1">
                <p>Tên đăng nhập: <span className="text-amber-200">{result.credentials.username}</span></p>
                <p>Mật khẩu tạm: <span className="text-amber-200">{result.credentials.tempPassword}</span></p>
              </div>
              <Button size="sm" variant="outline" onClick={copyCreds}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã sao chép' : 'Sao chép'}
              </Button>
              <p className="text-[11px] text-slate-400">Người dùng sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.</p>
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
    <Modal title="Thêm người dùng" subtitle="Nhập email để gửi lời mời, hoặc bỏ trống để nhận mật khẩu tạm" onClose={onClose} size="md">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Vai trò">
            <Select {...register('role')}>
              <option value="STUDENT">Học viên</option>
              <option value="TEACHER">Giảng viên</option>
            </Select>
          </FormField>
          <FormField label="Mã người dùng" error={errors.userCode?.message}>
            <Input placeholder="GV001 / SV2021001" {...register('userCode', { required: 'Bắt buộc để sinh tên đăng nhập' })} />
          </FormField>
        </div>
        <FormField label="Họ tên" error={errors.fullName?.message}>
          <Input placeholder="Nguyễn Văn A" {...register('fullName', { required: 'Vui lòng nhập họ tên', minLength: { value: 2, message: 'Tối thiểu 2 ký tự' } })} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email (tuỳ chọn)">
            <Input type="email" placeholder="Có email → gửi lời mời kích hoạt" {...register('email')} />
          </FormField>
          <FormField label="Số điện thoại">
            <Input placeholder="0912345678" {...register('phone')} />
          </FormField>
        </div>
        <FormField label="Khoa / Bộ môn">
          <Input placeholder="Khoa CNTT (tuỳ chọn)" {...register('department')} />
        </FormField>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Huỷ</Button>
          <Button type="submit" disabled={loading}>
            <UserPlus size={15} /> {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
