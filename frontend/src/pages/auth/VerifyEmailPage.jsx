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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <Loader size={40} className="mx-auto text-indigo-400 animate-spin mb-4" />
            <p className="text-gray-500">Đang xác nhận tài khoản...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thành công!</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận thất bại</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link to="/register" className="text-indigo-600 hover:underline text-sm font-medium">Đăng ký lại</Link>
          </>
        )}
      </div>
    </div>
  );
}
