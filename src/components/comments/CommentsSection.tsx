"use client";
import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Trash2, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatDate } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface Comment {
  id: number;
  content: string;
  parentId: number | null;
  isEdited: boolean;
  createdAt: string;
  userId: number;
  username: string;
}

interface CommentsSectionProps {
  slug: string;
  chapterIndex?: number;
}

export function CommentsSection({ slug, chapterIndex }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ slug });
      if (chapterIndex !== undefined) params.set("chapter", String(chapterIndex));
      const res = await fetch(`/api/comments?${params}`);
      const data = await res.json();
      setComments(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [slug, chapterIndex]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function submitComment() {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: text, chapterIndex: chapterIndex ?? null, parentId: replyTo?.id ?? null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setComments(prev => [data.data, ...prev]);
      setText("");
      setReplyTo(null);
    } catch { toast.error("Failed to post comment"); }
    finally { setSubmitting(false); }
  }

  async function deleteComment(id: number) {
    if (!confirm("Delete this comment?")) return;
    try {
      await fetch("/api/comments", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      setComments(prev => prev.filter(c => c.id !== id));
    } catch { toast.error("Failed to delete"); }
  }

  // Build tree
  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);
  const getReplies = (id: number) => replies.filter(r => r.parentId === id);

  return (
    <div className="mt-8">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-4 group">
        <MessageCircle size={18} className="text-accent" />
        <span className="font-display font-bold text-text-primary text-lg">
          Comments ({comments.length})
        </span>
        {collapsed ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronUp size={16} className="text-text-muted" />}
      </button>

      {!collapsed && (
        <div className="space-y-4">
          {/* Input */}
          {user ? (
            <div className="bg-bg-card border border-border rounded-xl p-4">
              {replyTo && (
                <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg text-sm">
                  <span className="text-text-secondary">Replying to <span className="text-accent font-medium">@{replyTo.username}</span></span>
                  <button onClick={() => setReplyTo(null)} className="text-text-muted hover:text-text-primary text-xs">Cancel</button>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-sm font-bold text-white">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submitComment(); }}
                    placeholder="Write a comment... (Ctrl+Enter to submit)"
                    rows={2}
                    className="input-field resize-none text-sm"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={submitComment}
                      disabled={!text.trim() || submitting}
                      className="btn-primary text-sm py-1.5 px-3 disabled:opacity-50">
                      <Send size={14} />
                      {submitting ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-text-secondary text-sm mb-3">Sign in to leave a comment</p>
              <div className="flex justify-center gap-2">
                <Link href="/login" className="btn-primary text-sm py-1.5 px-4">Login</Link>
                <Link href="/register" className="btn-secondary text-sm py-1.5 px-4">Register</Link>
              </div>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : topLevel.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {topLevel.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  replies={getReplies(comment.id)}
                  currentUserId={user?.userId}
                  onDelete={deleteComment}
                  onReply={c => setReplyTo({ id: c.id, username: c.username })}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment, replies, currentUserId, onDelete, onReply,
}: {
  comment: Comment;
  replies: Comment[];
  currentUserId?: number;
  onDelete: (id: number) => void;
  onReply: (c: Comment) => void;
}) {
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="bg-bg-card border border-border/50 rounded-xl p-3.5">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-bg-elevated flex-shrink-0 flex items-center justify-center text-xs font-bold text-text-secondary border border-border">
          {comment.username[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text-primary">{comment.username}</span>
            <span className="text-xs text-text-muted">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && <span className="text-xs text-text-dim">(edited)</span>}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => onReply(comment)} className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors">
              <Reply size={12} /> Reply
            </button>
            {currentUserId === comment.userId && (
              <button onClick={() => onDelete(comment.id)} className="flex items-center gap-1 text-xs text-text-muted hover:text-red-400 transition-colors">
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-3 ml-10">
          <button onClick={() => setShowReplies(!showReplies)} className="text-xs text-text-muted hover:text-accent transition-colors mb-2 flex items-center gap-1">
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
          {showReplies && (
            <div className="space-y-2 border-l-2 border-border pl-3">
              {replies.map(r => (
                <div key={r.id} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-bg-elevated flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-text-secondary border border-border">
                    {r.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-text-primary">{r.username}</span>
                      <span className="text-[10px] text-text-muted">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{r.content}</p>
                    {currentUserId === r.userId && (
                      <button onClick={() => onDelete(r.id)} className="flex items-center gap-1 text-[10px] text-text-muted hover:text-red-400 transition-colors mt-1">
                        <Trash2 size={10} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
