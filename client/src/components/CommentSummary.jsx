import React, { useState } from 'react';
import { api } from '../api.js';

export default function CommentSummary({ photoId, provider }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function summarize() {
    setBusy(true);
    setError('');
    try {
      setResult(await api('/photos/' + photoId + '/comments/summary', { method: 'POST' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="comment-summary">
      {result ? (
        <div role="status">
          <strong>AI summary</strong>
          <p dir="auto">{result.summary}</p>
          <small>Based on the latest {result.commentCount} {result.commentCount === 1 ? 'comment' : 'comments'}.</small>
        </div>
      ) : (
        <>
          <button className="outline" type="button" disabled={busy} onClick={summarize}>
            {busy ? 'Summarizing…' : 'Summarize comments'}
          </button>
          <small>{provider === 'ollama' ? 'Summarizes up to 20 recent comments locally with Ollama.' : 'Sends up to 20 recent comments to OpenAI.'}</small>
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
