import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle, UserPlus } from 'lucide-react';
import { register as registerApi } from '../../api/auth.api';
import AuthShell from '../../components/layout/AuthShell';
import FormField, { Input, Button } from '../../components/ui/FormField';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await registerApi(data);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-500/15 ring-1 ring-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-300" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Đăng ký thành công!</h2>
          <p className="text-slate-400 text-sm mb-6">Tài khoản của bạn đã được tạo. Bạn có thể đăng nhập ngay bây giờ.</p>
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
      headline={'Bắt đầu hành trình\nhọc tập của bạn'}
      tagline="Tạo tài khoản để truy cập lớp học, bài giảng và lớp học trực tuyến."
    >
      <h1 className="text-2xl font-bold text-white tracking-tight">Tạo tài khoản mới</h1>
      <p className="text-slate-400 text-sm mt-2 mb-9">Điền thông tin bên dưới để đăng ký</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Họ tên" error={errors.fullName?.message}>
          <Input placeholder="Nguyễn Văn A" {...register('fullName', { required: 'Vui lòng nhập họ tên' })} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="email@example.com" {...register('email', { required: 'Vui lòng nhập email' })} />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message}>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password', { required: 'Vui lòng nhập mật khẩu', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
          />
        </FormField>

        <FormField label="Số điện thoại">
          <Input placeholder="0912345678 (tuỳ chọn)" {...register('phone')} />
        </FormField>

        <FormField label="Mã lớp học" error={errors.classCode?.message}>
          <Input
            placeholder="Mã lớp do giảng viên / nhà trường cung cấp"
            {...register('classCode', { required: 'Vui lòng nhập mã lớp học' })}
          />
        </FormField>

        <Button type="submit" disabled={loading} className="w-full !py-3 !mt-8">
          <UserPlus size={16} />
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-7">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-indigo-200 hover:underline font-semibold">Đăng nhập</Link>
      </p>
    </AuthShell>
  );
}
