'use client';

import { useState } from 'react';
import { Star, ThumbsUp, Reply } from 'lucide-react';

const REVIEWS = [
  { id: '1', customer: 'Nguyễn Văn Minh', court: 'Sân A1', rating: 5, date: '22/04/2025', text: 'Sân rất đẹp, đèn LED sáng, nhân viên nhiệt tình. Sẽ quay lại!', replies: 0 },
  { id: '2', customer: 'Trần Thị Lan', court: 'Sân A2', rating: 4, date: '21/04/2025', text: 'Sân tốt, giá hợp lý. Nhưng hơi ồn do gần đường.', replies: 1 },
  { id: '3', customer: 'Lê Hoàng Phong', court: 'Sân A1', rating: 5, date: '20/04/2025', text: 'Tuyệt vời! Đặt sân online rất tiện, không phải chờ đợi.', replies: 0 },
  { id: '4', customer: 'Phạm Thị Hương', court: 'Sân A3', rating: 3, date: '19/04/2025', text: 'Sàn cao su hơi trơn. Nên cải thiện thêm.', replies: 0 },
  { id: '5', customer: 'Hoàng Văn Đức', court: 'Sân A4', rating: 5, date: '18/04/2025', text: 'Có mái che nên mưa vẫn chơi được. Rất hài lòng!', replies: 2 },
  { id: '6', customer: 'Vũ Thị Mai', court: 'Sân A5', rating: 4, date: '17/04/2025', text: 'Sân sạch sẽ, nước uống miễn phí. Khuyến khích mọi người đến.', replies: 0 },
];

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < value ? (
          <Star key={i} className="w-3.5 h-3.5 text-[#D4FF00]" fill="#D4FF00" />
        ) : (
          <Star key={i} className="w-3.5 h-3.5 text-gray-200" />
        )
      )}
    </div>
  );
}

export default function OwnerReviewsPage() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
  const ratingCounts = [0, 0, 0, 0, 0, 0];
  REVIEWS.forEach((r) => ratingCounts[r.rating]++);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-lexend text-[#085041]">Đánh giá</h1>
        <div className="flex items-center gap-2 bg-[#0F6E56]/5 px-4 py-2 rounded-xl">
          <Star className="w-5 h-5 text-[#D4FF00]" fill="#D4FF00" />
          <span className="text-xl font-bold font-lexend text-[#0F6E56]">{avgRating}</span>
          <span className="text-sm text-gray-400">/ 5</span>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-4xl font-bold font-lexend text-gray-900">{avgRating}</p>
            <StarRow value={Math.round(parseFloat(avgRating))} />
            <p className="text-xs text-gray-400 mt-1">{REVIEWS.length} đánh giá</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = REVIEWS.length > 0 ? (ratingCounts[star] / REVIEWS.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">{star}★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-[#D4FF00] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{ratingCounts[star]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {REVIEWS.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0F6E56]/10 flex items-center justify-center font-bold text-[#0F6E56] flex-shrink-0">
                  {r.customer.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{r.customer}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRow value={r.rating} />
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-[#0F6E56] font-medium">{r.court}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{r.text}</p>
            <div className="flex items-center gap-3 mt-3">
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0F6E56] transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                Hữu ích
              </button>
              <button
                onClick={() => setReplyingTo(replyingTo === r.id ? null : r.id)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0F6E56] transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Trả lời {r.replies > 0 && `(${r.replies})`}
              </button>
            </div>

            {replyingTo === r.id && (
              <div className="mt-3 flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Viết phản hồi..."
                  rows={2}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0F6E56] resize-none"
                />
                <div className="flex flex-col gap-1">
                  <button className="px-3 py-1.5 bg-[#0F6E56] text-white text-xs font-semibold rounded-lg hover:bg-[#085041] transition-colors">
                    Gửi
                  </button>
                  <button
                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    className="px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
