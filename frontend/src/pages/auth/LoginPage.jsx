import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn } from 'lucide-react';
import { login } from '../../api/auth.api';
import useAuthStore from '../../stores/authStore';
import AuthShell from '../../components/layout/AuthShell';
import FormField, { Input, Button } from '../../components/ui/FormField';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(data);
      setAuth(res.data);
      if (res.data.user?.mustChangePassword) return navigate('/first-password');
      const roles = res.data.user?.roles || [];
      if (roles.includes('SUPER_ADMIN')) navigate('/super');
      else if (roles.includes('ORG_ADMIN') || roles.includes('ADMIN')) navigate('/admin');
      else if (roles.includes('TEACHER')) navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={'Hệ thống quản lý\nđào tạo trực tuyến'}
      tagline="Quản lý lớp học, bài giảng, lớp học trực tuyến và theo dõi tiến độ học tập — tất cả trong một nền tảng."
    >
      <h1 className="text-2xl font-bold text-white tracking-tight">Chào mừng trở lại 👋</h1>
      <p className="text-slate-400 text-sm mt-2 mb-10">Đăng nhập để tiếp tục vào hệ thống</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Email hoặc tên đăng nhập" error={errors.email?.message}>
          <Input
            type="text"
            autoComplete="username"
            placeholder="email@example.com hoặc bkhn.gv001"
            {...register('email', { required: 'Vui lòng nhập email hoặc tên đăng nhập' })}
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
          />
        </FormField>

        <Button type="submit" disabled={loading} className="w-full !py-3 !mt-8">
          <LogIn size={16} />
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-8">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-indigo-300 hover:text-indigo-200 hover:underline font-semibold">Đăng ký ngay</Link>
      </p>
      <p className="text-center text-sm text-slate-400 mt-3">
        Đại diện trường / doanh nghiệp?{' '}
        <Link to="/org-register" className="text-indigo-300 hover:text-indigo-200 hover:underline font-semibold">Đăng ký tổ chức</Link>
      </p>
    </AuthShell>
  );
}
