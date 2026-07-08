import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { verifyEmail } from '../../api/auth.api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Liên kết không hợp lệ.'); return; }
    verifyEmail(token)
      .then(r => { setStatus('success'); setMessage(r.data.message); })
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.message || 'Xác nhận thất bại.'); });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass p-8 w-full max-w-md text-center">
        {/* Brand */}
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-lg font-extrabold text-white shadow-lg shadow-indigo-600/40 ring-1 ring-white/10 mx-auto mb-6">
          L
        </div>

        {status === 'loading' && (
          <>
            <Loader size={40} className="mx-auto text-indigo-400 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Đang xác nhận tài khoản...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-500/15 ring-1 ring-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Xác nhận thành công!</h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-indigo-500 to-violet-600 hover:brightness-110 text-white font-semibold rounded-xl px-6 py-2.5 text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              Đăng nhập ngay
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/15 ring-1 ring-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Xác nhận thất bại</h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Link to="/register" className="text-indigo-300 hover:text-indigo-200 hover:underline text-sm font-medium">Đăng ký lại</Link>
          </>
        )}
      </div>
    </div>
  );
}
