export default function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 backdrop-blur-2xl ring-1 ring-white/10 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-slate-200">
        <p className="text-slate-200 text-sm mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Huỷ</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/30">Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
