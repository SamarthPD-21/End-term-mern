"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from 'next/image';
import { postProductComment } from "@/lib/Product";
import axios from "axios";
import { getCurrentUser } from "@/lib/User";
import { notify } from '@/lib/toast';
import { confirmWithToast } from '@/lib/confirm';

interface Reply {
  adminId?: string;
  adminName?: string;
  adminImage?: string | null;
  text?: string;
  createdAt?: string;
}

interface Comment {
  _id?: string;
  userId?: string;
  name?: string;
  profileImage?: string | null;
  rating: number;
  text?: string;
  createdAt?: string;
  isEditing?: boolean;
  reply?: Reply | null;
}

export default function ProductComments({ productId }: { productId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ _id?: string; id?: string; name?: string; email?: string; profileImage?: string; isAdmin?: boolean } | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replyVisible, setReplyVisible] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // fetch comments for a page
  const fetchComments = async (p = 1) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
      const resp = await axios.get(`${API_URL}api/products/${productId}/comments`, { params: { page: p, limit } });
      const { comments: c = [], total: t = 0 } = resp.data || {};
      if (p === 1) setComments(c || []);
      else setComments((s) => [...s, ...(c || [])]);
      setTotal(t || 0);
    } catch (err) {
      console.error(err);
      notify.error('Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch comments and current user when productId changes
  useEffect(() => {
    fetchComments(page);

    (async () => {
      const me = await getCurrentUser();
      setUser(me?.user ?? me ?? null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // When comments change, progressively reveal any replies with a small animation
  useEffect(() => {
    // mark replies visible after a short delay to trigger transition
    const t = setTimeout(() => {
      setReplyVisible((prev) => {
        const next = { ...prev };
        try {
          (comments || []).forEach((c) => {
            if (c._id && c.reply) {
              next[String(c._id)] = true;
            }
            // if reply exists but _id is missing for some reason, still set by index fallback
            else if (c.reply) {
              next[String(c._id || '')] = true;
            }
          });
        } catch (e) {}
        return next;
      });
    }, 20);
    return () => clearTimeout(t);
  }, [comments]);

  const submit = async () => {
    if (!user) {
      notify.info('Please sign in to comment')
      return
    }
    setSubmitting(true);
    try {
      const res = await postProductComment(productId, { rating, text });
      const comment: Comment = res.comment || { _id: res.commentId || undefined, userId: user._id || user.id, name: user.name || user.email, rating, text, createdAt: new Date().toISOString() };
      setComments((s) => [comment, ...s]);
      setText("");
      setRating(5);
    } catch (err) {
      console.error("post comment error:", err);
      notify.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const editRefs = useRef<Record<string, { textRef: HTMLTextAreaElement | null; ratingRef: HTMLSelectElement | null }>>({});

  const startEdit = (c: Comment) => {
    setComments((s) => s.map((it) => ({ ...it, isEditing: it._id === c._id } as Comment & { isEditing?: boolean })));
    if (!editRefs.current[c._id || '']) editRefs.current[c._id || ''] = { textRef: null, ratingRef: null };
  };

  const cancelEdit = () => {
    setComments((s) => s.map((it) => ({ ...it, isEditing: false } as Comment & { isEditing?: boolean })));
  };

  const saveEdit = async (c: Comment, newText: string, newRating: number) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
      const resp = await axios.put(`${API_URL}api/products/${productId}/comments/${c._id}`, { rating: newRating, text: newText }, { withCredentials: true });
      const updated = resp.data.comment;
      setComments((s) => s.map((it) => (it._id === c._id ? { ...it, text: updated.text, rating: updated.rating, isEditing: false } : it)));
    } catch (err) {
      console.error('edit comment error', err);
      notify.error('Failed to edit comment');
    }
  };

  const remove = async (c: Comment) => {
    const ok = await confirmWithToast('Delete this review?', { confirmText: 'Delete', cancelText: 'Cancel' })
    if (!ok) return
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/";
      await axios.delete(`${API_URL}api/products/${productId}/comments/${c._id}`, { withCredentials: true });
      setComments((s) => s.filter((it) => it._id !== c._id));
      setTotal((t) => Math.max(0, t - 1));
      notify.success('Comment deleted');
    } catch (err) {
      console.error('delete comment error', err);
      notify.error('Failed to delete comment');
    }
  };

  const loadMore = async () => {
    if (comments.length >= total) return;
    const next = page + 1;
    setPage(next);
    await fetchComments(next);
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold mb-4" style={{ color: "#368581", fontFamily: "Playfair Display" }}>
        Reviews
      </h3>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm animate-pop">
        <div className="flex items-center gap-4">
          <label className="font-semibold">Your rating:</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="p-2 border rounded">
            {[5,4,3,2,1].map((r)=> <option key={r} value={r}>{r} ⭐</option>)}
          </select>
        </div>
        <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write your review..." className="w-full mt-3 p-3 border rounded" />
        <div className="mt-3">
          <button onClick={submit} disabled={submitting} className="px-6 py-2 rounded bg-[#368581] text-white font-bold shadow hover:scale-105 transform transition-transform disabled:opacity-60">
            {submitting ? 'Posting...' : 'Post Review'}
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <div>Loading reviews...</div>
        ) : (
          <div className="space-y-4">
            {comments.length === 0 && <div className="text-gray-600">No reviews yet</div>}

            {comments.map((c, idx) => {
              const cid = String(c._id || idx);
              return (
              <div key={c._id || idx} className="p-4 bg-white rounded-lg shadow-sm transform transition-all duration-300 hover:translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {c.profileImage ? (
                      <Image src={c.profileImage} alt={c.name || 'user'} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">{(c.name || 'U').split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                    )}
                    <div>
                      <div className="font-semibold">{c.name || 'User'}</div>
                      <div className="text-xs text-gray-400">{new Date(c.createdAt || '').toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-yellow-500">{Array.from({length: c.rating || 0}).map((_, i) => <span key={i}>⭐</span>)}</div>
                </div>

                {c.isEditing ? (
                  <div className="mt-3">
                    <select defaultValue={c.rating} className="p-2 border rounded mb-2" ref={(el) => { if (c._id) editRefs.current[c._id] = { ...(editRefs.current[c._id] || {}), ratingRef: el } }}>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
                    </select>
                    <textarea defaultValue={c.text} className="w-full p-2 border rounded" ref={(el) => { if (c._id) editRefs.current[c._id] = { ...(editRefs.current[c._id] || {}), textRef: el } }} />
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => {
                        const refs = editRefs.current[c._id || ''];
                        const newText = refs?.textRef?.value ?? '';
                        const newRating = Number(refs?.ratingRef?.value ?? c.rating);
                        saveEdit(c, newText, newRating);
                      }} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
                      <button onClick={() => cancelEdit()} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-gray-700 mt-2">{c.text}</div>

                    {c.reply && (
                      <div className="mt-3">
                        <div
                          className={`flex items-start gap-3 bg-gray-50 rounded-md p-3 border-l-4 border-emerald-400 transition-all duration-300 transform ${replyVisible[cid] ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                        >
                          <div className="flex-shrink-0">
                            {c.reply.adminImage ? (
                              <Image src={c.reply.adminImage} alt={c.reply.adminName || 'Admin'} width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-400 text-white flex items-center justify-center font-semibold text-sm">
                                {(String(c.reply.adminName || 'A').split(' ').map(s=>s[0]).slice(0,2).join('') || 'A')}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold text-emerald-800">{c.reply.adminName || 'Admin'}</div>
                                <span className="inline-block text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Replied</span>
                              </div>
                              <div className="text-xs text-gray-400">{new Date(c.reply.createdAt || '').toLocaleString()}</div>
                            </div>
                            <div className="mt-1 text-gray-800 text-sm">{c.reply.text}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-2">
                      {(user && (String(user._id || user.id) === String(c.userId))) && (
                        <>
                          <button onClick={() => startEdit(c)} className="px-3 py-1 bg-yellow-100 rounded">Edit</button>
                          <button onClick={() => remove(c)} className="px-3 py-1 bg-red-100 rounded">Delete</button>
                        </>
                      )}
                      {user && (user as any).isAdmin && (
                        <>
                          {/* Admins can delete any comment */}
                          <button onClick={() => remove(c)} className="px-3 py-1 bg-red-100 rounded">Delete</button>
                          {/* Admin reply control (reply or edit) */}
                              <button onClick={() => {
                            setReplyDrafts((s) => ({ ...s, [cid]: c.reply?.text || '' }));
                            setReplyOpen((s) => ({ ...s, [cid]: true }));
                          }} className="px-3 py-1 bg-blue-100 rounded">{c.reply ? 'Edit Reply' : 'Reply'}</button>
                        </>
                      )}
                    </div>

                    {user && (user as any).isAdmin && replyOpen[cid] && (
                      <div className="mt-3">
                        <textarea value={replyDrafts[cid] ?? (c.reply?.text ?? '')} onChange={(e) => setReplyDrafts((s) => ({ ...s, [cid]: e.target.value }))} className="w-full p-2 border rounded mb-2" placeholder="Write a reply to this comment" />
                        <div className="flex gap-2">
                          <button onClick={async () => {
                            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';
                            try {
                              const text = (replyDrafts[cid] || '').trim();
                              if (!text) { notify.error('Reply cannot be empty'); return; }
                              const resp = await axios.post(`${API_URL}api/products/${productId}/comments/${c._id}/reply`, { text }, { withCredentials: true });
                              const updated = resp.data.comment || resp.data;
                              const newReply = updated.reply || resp.data.reply || null;
                              setComments((s) => s.map((it) => (String(it._id) === String(c._id) ? { ...it, reply: newReply } : it)));
                              // reveal with animation using consistent string key
                              setReplyVisible((s) => ({ ...s, [cid]: false }));
                              setTimeout(() => setReplyVisible((s) => ({ ...s, [cid]: true })), 20);
                              // clear draft and close editor
                              setReplyDrafts((s) => ({ ...s, [cid]: '' }));
                              setReplyOpen((s) => ({ ...s, [cid]: false }));
                              notify.success('Replied');
                            } catch (err) {
                              console.error('reply error', err);
                              notify.error('Failed to post reply');
                            }
                          }} className="px-3 py-1 bg-green-600 text-white rounded">Send Reply</button>
                          <button onClick={() => setReplyOpen((s) => ({ ...s, [cid]: false }))} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              );
            })}

            {comments.length < total && (
              <div className="text-center mt-4">
                <button onClick={loadMore} disabled={loadingMore} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                  {loadingMore ? 'Loading...' : `Load more (${comments.length}/${total})`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
