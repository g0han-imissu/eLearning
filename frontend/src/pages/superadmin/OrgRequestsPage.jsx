import { useEffect, useState } from 'react';
import { Inbox, Check, X, Eye } from 'lucide-react';
import { getOrgRequests, approveOrgRequest, rejectOrgRequest } from '../../api/platform.api';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Confirm from '../../components/ui/Confirm';
import PageHeader from '../../components/ui/PageHeader';
import { Button, Textarea } from '../../components/ui/FormField';

const statusVariant = { PENDING: 'yellow', APPROVED: 'green', REJECTED: 'red' };
const statusLabel = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối' };

export default function OrgRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [detail, setDetail] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = () => {
    setLoading(true);
    getOrgRequests(filter === 'ALL' ? {} : { status: filter })
      .then((r) => setRequests(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async () => {
    setBusy(true);
    try {
      const r = await approveOrgRequest(approveTarget.id);
      setNotice(r.data?.message || 'Đã duyệt yêu cầu.');
      setApproveTarget(null);
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Duyệt thất bại');
      setApproveTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await rejectOrgRequest(rejectTarget.id, rejectReason || undefined);
      setNotice('Đã từ chối yêu cầu.');
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (err) {
      setNotice(err.response?.data?.message || 'Từ chối thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Yêu cầu đăng ký"
        subtitle="Duyệt các tổ chức muốn sử dụng nền tảng"
        icon={<Inbox size={20} />}
      />

      {notice && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-indigo-300 hover:text-white"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-1.5">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-300'
            }`}
          >
            {s === 'ALL' ? 'Tất cả' : statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-b border-white/10">
                {['Tổ chức', 'Người đại diện', 'Quy mô', 'Ngày gửi', 'Trạng thái', 'Thao tác'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Đang tải...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Không có yêu cầu nào</td></tr>
              ) : requests.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white">{r.orgName}</p>
                    {r.organization && <p className="text-xs text-indigo-300">→ {r.organization.slug}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-slate-300">{r.contactName}</p>
                    <p className="text-xs text-slate-500">{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">{r.expectedUsers ?? '—'}</td>
                  <td className="px-5 py-3.5 text-slate-400 text-xs">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3.5"><Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge></td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setDetail(r)}
                        title="Chi tiết"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setApproveTarget(r)}
                            title="Duyệt"
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => { setRejectTarget(r); setRejectReason(''); }}
                            title="Từ chối"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <Modal title={`Yêu cầu — ${detail.orgName}`} onClose={() => setDetail(null)} size="md">
          <div className="space-y-3 text-sm">
            {[
              ['Tổ chức', detail.orgName],
              ['Người đại diện', detail.contactName],
              ['Email', detail.email],
              ['Điện thoại', detail.phone || '—'],
              ['Quy mô dự kiến', detail.expectedUsers ?? '—'],
              ['Ghi chú', detail.note || '—'],
              ['Ngày gửi', new Date(detail.createdAt).toLocaleString('vi-VN')],
              ['Trạng thái', statusLabel[detail.status]],
              ...(detail.status === 'REJECTED' ? [['Lý do từ chối', detail.rejectReason || '—']] : []),
              ...(detail.reviewedBy ? [['Người xử lý', detail.reviewedBy.fullName]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <p className="w-36 flex-shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide pt-0.5">{k}</p>
                <p className="text-slate-100 whitespace-pre-wrap">{v}</p>
              </div>
            ))}
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setDetail(null)}>Đóng</Button>
            </div>
          </div>
        </Modal>
      )}

      {approveTarget && (
        <Confirm
          message={`Duyệt yêu cầu của "${approveTarget.orgName}"? Hệ thống sẽ tạo Organization, tài khoản quản trị và gửi email kích hoạt tới ${approveTarget.email}.`}
          onConfirm={busy ? undefined : handleApprove}
          onCancel={() => setApproveTarget(null)}
        />
      )}

      {rejectTarget && (
        <Modal title={`Từ chối — ${rejectTarget.orgName}`} onClose={() => setRejectTarget(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Lý do từ chối sẽ được gửi tới email người đại diện.</p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Lý do từ chối (tuỳ chọn)"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Huỷ</Button>
              <Button variant="danger" onClick={handleReject} disabled={busy}>
                {busy ? 'Đang xử lý...' : 'Từ chối yêu cầu'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
