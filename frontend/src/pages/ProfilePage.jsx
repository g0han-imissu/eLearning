import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, CheckCircle } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { updateProfile, requestChangePassword, confirmChangePassword } from '../api/auth.api';
import { Button, Input } from '../components/ui/FormField';

export default function ProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);

  const profileForm = useForm({ defaultValues: { fullName: user?.fullName || '', phone: user?.phone || '' } });
  const pwForm = useForm();

  const handleUpdateProfile = async (data) => {
    setError(''); setSuccess('');
    try {
      const res = await updateProfile(data);
      setAuth({ user: { ...user, ...res.data }, accessToken, refreshToken });
      setSuccess('Cập nhật hồ sơ thành công');
    } catch (e) { setError(e.response?.data?.message || 'Lỗi'); }
  };

  const handleRequestOtp = async () => {
    setSending(true); setError(''); setSuccess('');
    try {
      await requestChangePassword();
      setOtpSent(true);
      setSuccess('OTP đã gửi đến email của bạn. Kiểm tra hộp thư.');
    } catch (e) { setError(e.response?.data?.message || 'Lỗi'); }
    finally { setSending(false); }
  };

  const handleChangePassword = async (data) => {
    setError(''); setSuccess('');
    try {
      await confirmChangePassword(data);
      setSuccess('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
      pwForm.reset();
      setOtpSent(false);
    } catch (e) { setError(e.response?.data?.message || 'Lỗi'); }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Tài khoản của tôi</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {[{ key: 'profile', label: 'Hồ sơ', icon: User }, { key: 'password', label: 'Đổi mật khẩu', icon: Lock }].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} />{success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : <span className="text-2xl font-bold text-indigo-600">{user?.fullName?.[0]}</span>}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.fullName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex gap-1 mt-1">
                {user?.roles?.map(r => (
                  <span key={r} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          </div>
          <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Họ tên</label>
              <Input {...profileForm.register('fullName')} /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1 block">Số điện thoại</label>
              <Input {...profileForm.register('phone')} /></div>
            <Button type="submit">Lưu thay đổi</Button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {!otpSent ? (
            <div className="text-center py-4">
              <Lock size={40} className="mx-auto text-indigo-300 mb-3" />
              <p className="text-sm text-gray-600 mb-4">Để đổi mật khẩu, chúng tôi sẽ gửi mã OTP đến email của bạn.</p>
              <p className="text-sm font-medium text-gray-800 mb-5">{user?.email}</p>
              <Button onClick={handleRequestOtp} disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi mã OTP'}</Button>
            </div>
          ) : (
            <form onSubmit={pwForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mã OTP (từ email)</label>
                <Input {...pwForm.register('otp', { required: true })} placeholder="6 chữ số" maxLength={6} /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu hiện tại</label>
                <Input type="password" {...pwForm.register('currentPassword', { required: true })} /></div>
              <div><label className="text-sm font-medium text-gray-700 mb-1 block">Mật khẩu mới</label>
                <Input type="password" {...pwForm.register('newPassword', { required: true, minLength: 6 })} /></div>
              <div className="flex gap-2">
                <Button type="submit">Đổi mật khẩu</Button>
                <Button type="button" variant="ghost" onClick={() => setOtpSent(false)}>Gửi lại OTP</Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
