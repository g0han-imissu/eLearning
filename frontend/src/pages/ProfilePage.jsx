import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Lock, CheckCircle, Camera, BookOpen } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { updateProfile, requestChangePassword, confirmChangePassword } from '../api/auth.api';
import { uploadImage } from '../api/upload.api';
import { Button, Input } from '../components/ui/FormField';

export default function ProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isTeacher = user?.roles?.includes('TEACHER');

  const profileForm = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
      bio: user?.bio || '',
    },
  });

  const pwForm = useForm();

  const handleUpdateProfile = async (data) => {
    setError(''); setSuccess('');
    try {
      const payload = { fullName: data.fullName, phone: data.phone };
      if (isTeacher) {
        payload.specialization = data.specialization;
        payload.bio = data.bio;
      }
      const res = await updateProfile(payload);
      setAuth({ user: { ...user, ...res.data }, accessToken, refreshToken });
      setSuccess('Cập nhật hồ sơ thành công');
    } catch (e) { setError(e.response?.data?.message || 'Lỗi cập nhật'); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(''); setSuccess('');
    try {
      const res = await uploadImage(file);
      const avatarUrl = res.data?.url;
      if (avatarUrl) {
        const updated = await updateProfile({ avatarUrl });
        setAuth({ user: { ...user, ...updated.data }, accessToken, refreshToken });
        setSuccess('Cập nhật ảnh đại diện thành công');
      }
    } catch (e) { setError(e.response?.data?.message || 'Lỗi tải ảnh'); }
    finally { setUploading(false); }
  };

  const handleRequestOtp = async () => {
    setSending(true); setError(''); setSuccess('');
    try {
      await requestChangePassword();
      setOtpSent(true);
      setSuccess('OTP đã gửi đến email của bạn.');
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

  const tabs = [
    { key: 'profile', label: 'Hồ sơ', icon: User },
    { key: 'password', label: 'Đổi mật khẩu', icon: Lock },
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tài khoản của tôi</h1>
        <p className="text-sm text-slate-400 mt-1">Quản lý thông tin cá nhân và bảo mật</p>
      </div>

      <div className="flex gap-1 mb-6 bg-white/10 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white/5 shadow text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 mb-4 text-sm">
          <CheckCircle size={16} />{success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
      )}

      {tab === 'profile' && (
        <div className="glass overflow-hidden">
          {/* Avatar section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-24" />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-slate-800 rounded-full ring-4 ring-slate-900/70 shadow-lg shadow-black/30 flex items-center justify-center overflow-hidden">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-3xl font-bold text-indigo-300">{user?.fullName?.[0]}</span>}
                </div>
                <label className={`absolute -bottom-1 -right-1 w-7 h-7 bg-white/5 border border-white/10 rounded-full flex items-center justify-center cursor-pointer shadow hover:bg-white/5 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                  <Camera size={13} className="text-slate-400" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                </label>
              </div>
              <div className="mb-1">
                <p className="font-bold text-white text-lg">{user?.fullName}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <div className="flex gap-1 mt-1">
                  {user?.roles?.map(r => (
                    <span key={r} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r === 'ADMIN' ? 'bg-purple-500/15 text-purple-300' :
                      r === 'TEACHER' ? 'bg-blue-500/15 text-blue-300' : 'bg-white/10 text-slate-300'
                    }`}>{r === 'ADMIN' ? 'Quản trị' : r === 'TEACHER' ? 'Giảng viên' : 'Học viên'}</span>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-200 mb-1.5 block">Họ tên</label>
                  <Input {...profileForm.register('fullName')} placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-200 mb-1.5 block">Số điện thoại</label>
                  <Input {...profileForm.register('phone')} placeholder="0901234567" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-200 mb-1.5 block">Email</label>
                <Input value={user?.email} disabled className="bg-white/5 text-slate-500 cursor-not-allowed" />
              </div>

              {isTeacher && (
                <>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <BookOpen size={15} className="text-indigo-400" />Thông tin giảng viên
                    </p>
                    <div>
                      <label className="text-sm font-medium text-slate-200 mb-1.5 block">Chuyên môn</label>
                      <Input {...profileForm.register('specialization')} placeholder="Ví dụ: Toán học, Lập trình..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-200 mb-1.5 block">Giới thiệu bản thân</label>
                    <textarea
                      {...profileForm.register('bio')}
                      rows={4}
                      placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm giảng dạy..."
                      className="glass-input resize-none"
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <div className="glass p-6">
          {!otpSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-indigo-400" />
              </div>
              <p className="text-slate-300 mb-2">Để đổi mật khẩu, chúng tôi sẽ gửi mã OTP đến email của bạn.</p>
              <p className="text-sm font-semibold text-slate-100 mb-6">{user?.email}</p>
              <Button onClick={handleRequestOtp} disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi mã OTP'}</Button>
            </div>
          ) : (
            <form onSubmit={pwForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <div><label className="text-sm font-medium text-slate-200 mb-1.5 block">Mã OTP (từ email)</label>
                <Input {...pwForm.register('otp', { required: true })} placeholder="6 chữ số" maxLength={6} /></div>
              <div><label className="text-sm font-medium text-slate-200 mb-1.5 block">Mật khẩu hiện tại</label>
                <Input type="password" {...pwForm.register('currentPassword', { required: true })} /></div>
              <div><label className="text-sm font-medium text-slate-200 mb-1.5 block">Mật khẩu mới</label>
                <Input type="password" {...pwForm.register('newPassword', { required: true, minLength: 6 })} /></div>
              <div className="flex gap-2 pt-2">
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
