import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { activateAccount } from '../../api/auth.api';
import AuthShell from '../../components/layout/AuthShell';
import FormField, { Input, Button } from '../../components/ui/FormField';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await activateAccount({ token, password: data.password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Kích hoạt thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-white mb-2">Liên kết không hợp lệ</h2>
          <p className="text-slate-400 text-sm mb-6">Liên kết kích hoạt bị thiếu hoặc không đúng định dạng.</p>
          <Link to="/login" className="text-indigo-300 hover:text-indigo-200 hover:underline font-semibold text-sm">Về trang đăng nhập</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/15 ring-1 ring-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-300" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Kích hoạt thành công!</h2>
          <p className="text-slate-400 text-sm mb-6">Tài khoản của bạn đã sẵn sàng. Đăng nhập để bắt đầu quản lý tổ chức.</p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white font-semibold rounded-xl px-6 py-2.5 text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      headline={'Chỉ còn một bước\nđể bắt đầu'}
      tagline="Đặt mật khẩu cho tài khoản quản trị tổ chức của bạn."
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/30 flex items-center justify-center">
          <ShieldCheck size={20} className="text-indigo-300" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Kích hoạt tài khoản</h1>
      </div>
      <p className="text-slate-400 text-sm mt-2 mb-8">Tạo mật khẩu mới để hoàn tất kích hoạt.</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Mật khẩu mới" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
          />
        </FormField>

        <FormField label="Nhập lại mật khẩu" error={errors.confirm?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirm', {
              required: 'Vui lòng nhập lại mật khẩu',
              validate: (v) => v === watch('password') || 'Mật khẩu không khớp',
            })}
          />
        </FormField>

        <Button type="submit" disabled={loading} className="w-full !py-3 !mt-8">
          <KeyRound size={16} />
          {loading ? 'Đang kích hoạt...' : 'Kích hoạt tài khoản'}
        </Button>
      </form>
    </AuthShell>
  );
}
