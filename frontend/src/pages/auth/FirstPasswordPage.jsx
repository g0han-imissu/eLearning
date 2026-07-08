import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { firstChangePassword } from '../../api/auth.api';
import useAuthStore from '../../stores/authStore';
import FormField, { Input, Button } from '../../components/ui/FormField';

// Bắt buộc đổi mật khẩu tạm ở lần đăng nhập đầu tiên
export default function FirstPasswordPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  if (!user) return <Navigate to="/login" replace />;
  if (!user.mustChangePassword) return <Navigate to="/" replace />;

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await firstChangePassword({ newPassword: data.password });
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/30 flex items-center justify-center">
            <ShieldAlert size={20} className="text-amber-300" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Đổi mật khẩu lần đầu</h1>
        </div>
        <p className="text-slate-400 text-sm mt-2 mb-7">
          Xin chào <span className="text-white font-semibold">{user.fullName}</span> — bạn đang dùng mật khẩu tạm.
          Hãy đặt mật khẩu mới để tiếp tục sử dụng hệ thống.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField label="Mật khẩu mới" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password', { required: 'Vui lòng nhập mật khẩu mới', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
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

          <Button type="submit" disabled={loading} className="w-full !py-3 !mt-7">
            <KeyRound size={16} />
            {loading ? 'Đang xử lý...' : 'Đặt mật khẩu mới'}
          </Button>
        </form>
      </div>
    </div>
  );
}
