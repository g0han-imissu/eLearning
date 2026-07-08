import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, CheckCircle, Send } from 'lucide-react';
import { submitOrgRegistration } from '../../api/platform.api';
import AuthShell from '../../components/layout/AuthShell';
import FormField, { Input, Textarea, Button } from '../../components/ui/FormField';

export default function OrgRegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await submitOrgRegistration({
        ...data,
        expectedUsers: data.expectedUsers ? Number(data.expectedUsers) : undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi yêu cầu thất bại');
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
          <h2 className="text-xl font-bold text-white mb-2">Đã gửi yêu cầu!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Yêu cầu đăng ký của tổ chức bạn đang được xét duyệt.
            Kết quả sẽ được gửi tới email người đại diện trong thời gian sớm nhất.
          </p>
          <Link
            to="/login"
            className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white font-semibold rounded-xl px-6 py-2.5 text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthShell
      headline={'Đưa tổ chức của bạn\nlên nền tảng LMS'}
      tagline="Trường đại học, doanh nghiệp hay trung tâm đào tạo — đăng ký để có không gian quản lý đào tạo riêng, tách biệt và bảo mật."
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 ring-1 ring-indigo-500/30 flex items-center justify-center">
          <Building2 size={20} className="text-indigo-300" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Đăng ký sử dụng</h1>
      </div>
      <p className="text-slate-400 text-sm mt-2 mb-8">
        Điền thông tin tổ chức. Sau khi được duyệt, tài khoản quản trị sẽ được gửi tới email người đại diện.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormField label="Tên tổ chức" error={errors.orgName?.message}>
          <Input placeholder="Đại học Bách Khoa Hà Nội" {...register('orgName', { required: 'Vui lòng nhập tên tổ chức' })} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Người đại diện" error={errors.contactName?.message}>
            <Input placeholder="Nguyễn Văn A" {...register('contactName', { required: 'Vui lòng nhập người đại diện' })} />
          </FormField>
          <FormField label="Số điện thoại">
            <Input placeholder="0912345678" {...register('phone')} />
          </FormField>
        </div>

        <FormField label="Email người đại diện" error={errors.email?.message}>
          <Input type="email" placeholder="admin@truong.edu.vn" {...register('email', { required: 'Vui lòng nhập email' })} />
        </FormField>

        <FormField label="Quy mô người dùng dự kiến">
          <Input type="number" min="1" placeholder="Ví dụ: 500" {...register('expectedUsers')} />
        </FormField>

        <FormField label="Ghi chú">
          <Textarea placeholder="Nhu cầu sử dụng, thời gian dự kiến triển khai... (tuỳ chọn)" {...register('note')} />
        </FormField>

        <Button type="submit" disabled={loading} className="w-full !py-3 !mt-8">
          <Send size={16} />
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu đăng ký'}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-7">
        Tổ chức của bạn đã có tài khoản?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-indigo-200 hover:underline font-semibold">Đăng nhập</Link>
      </p>
    </AuthShell>
  );
}
