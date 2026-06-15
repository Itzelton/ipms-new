"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { getDiscussionThreadForSubmission, postDiscussionMessage, DiscussionMessage } from '../../services/discussion';

function formatAuthor(author: { firstName?: string; lastName?: string; preferredName?: string }) {
  return author.preferredName || `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'Unknown';
}

function MessageRow({ message, onReply, depth }: { message: DiscussionMessage; onReply: (message: DiscussionMessage) => void; depth?: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" style={{ marginLeft: `${(depth || 0) * 1.5}rem` }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">{formatAuthor(message.author)}</div>
          <div className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</div>
        </div>
        <button type="button" onClick={() => onReply(message)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
          Reply
        </button>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{message.content}</p>
      {message.replies && message.replies.length > 0 && (
        <div className="mt-4 space-y-3">
          {message.replies.map((reply) => (
            <MessageRow key={reply.id} message={reply} onReply={onReply} depth={(depth || 0) + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubmissionDiscussionPanel({ submissionId }: { submissionId?: string | null }) {
  const [thread, setThread] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<DiscussionMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!submissionId) {
      setThread(null);
      return;
    }
    setLoading(true);
    getDiscussionThreadForSubmission(submissionId)
      .then((data) => setThread(data))
      .catch(() => setThread(null))
      .finally(() => setLoading(false));
  }, [submissionId]);

  const topMessages = useMemo(() => {
    if (!thread?.messages) return [];
    return thread.messages.filter((message: DiscussionMessage) => !message.parentMessageId);
  }, [thread]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!thread || !content.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await postDiscussionMessage(thread.id, content.trim(), replyTo?.id);
      setContent('');
      setReplyTo(null);
      const refreshed = await getDiscussionThreadForSubmission(submissionId || '');
      setThread(refreshed);
    } catch (err) {
      setError('Unable to post comment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded bg-white p-6 shadow">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Discussion</h3>
          <p className="text-sm text-slate-500">Supervisor comments and student replies are tracked here.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">Thread</span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading discussion...</p>
      ) : thread ? (
        <div className="space-y-4">
          {topMessages.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-600">No discussion messages yet. Start the conversation.</div>
          ) : (
            topMessages.map((message: DiscussionMessage) => (
              <MessageRow key={message.id} message={message} onReply={setReplyTo} />
            ))
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {replyTo && (
              <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                Replying to {formatAuthor(replyTo.author)}. <button type="button" onClick={() => setReplyTo(null)} className="font-semibold underline">Cancel</button>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Add a reply</label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="Type your comment and mention classmates or supervisors with @"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Use @mentions to notify collaborators.</p>
              <button type="submit" disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Posting...' : 'Post reply'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No discussion thread could be loaded for this submission.</p>
      )}
    </div>
  );
}
