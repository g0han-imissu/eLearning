/** Card — vỏ kính mờ tối (glass), bo góc 2xl. */
export default function Card({ children, className = '', padded = true, hover = false }) {
  return (
    <div className={`glass ${hover ? 'hover:bg-white/[0.08] transition-colors' : ''} ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

/** TableCard — vỏ glass cho bảng, kèm cuộn ngang trên mobile. */
export function TableCard({ children, className = '' }) {
  return (
    <div className={`glass overflow-hidden ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
