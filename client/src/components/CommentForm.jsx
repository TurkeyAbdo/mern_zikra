import React, { useState } from 'react';
import { api } from '../api.js';
export default function CommentForm({ photoId, onAdded }) {
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const saved = await api('/photos/' + photoId + '/comments', { method: 'POST', body: { comment } });
      onAdded(saved); setComment('');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <form onSubmit={submit}><label>Add a comment<textarea rows="3" value={comment} onChange={e => setComment(e.target.value)} maxLength={1000} required/></label>
    {error && <p className="error" role="alert">{error}</p>}<button className="primary" disabled={busy || !comment.trim()}>{busy ? 'Posting…' : 'Post comment'}</button></form>;
}
