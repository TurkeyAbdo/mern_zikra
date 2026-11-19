import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, author, dateLabel, photoUrl, useResource } from '../api.js';
import Feedback from '../components/Feedback.jsx';
import Icon from '../components/Icon.jsx';
import CommentForm from '../components/CommentForm.jsx';

export default function PhotoDetail({ user }) {
  const { id } = useParams();
  const resource = useResource('/photos/' + id);
  const photo = resource.data;
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setBusy(true);
    setError('');
    try {
      await api('/photos/' + id, { method: 'DELETE' });
      navigate('/gallery', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page detail">
      <Link to="/gallery" className="back">
        <Icon name="back" size={15} />
        Back to gallery
      </Link>
      <Feedback resource={resource}>
        {photo && (
          <>
            <div className="detail-layout">
              <div className="full-photo">
                <img src={photoUrl(photo)} alt={photo.title} />
              </div>
              <div className="detail-copy">
                <div className="eyebrow">
                  <span className="rule" />
                  Photo journal
                </div>
                <h1>{photo.title}</h1>
                <p className="byline">{author(photo.userId)}</p>
                <time dateTime={photo.dateTime}>
                  {dateLabel(photo.dateTime)}
                </time>
                {photo.description && (
                  <p className="caption">{photo.description}</p>
                )}
                {user?._id === photo.userId?._id &&
                  user &&
                  (confirm ? (
                    <div className="delete-confirm">
                      <p>Delete this photo and its comments?</p>
                      <div className="actions">
                        <button
                          className="danger"
                          disabled={busy}
                          onClick={remove}
                        >
                          Confirm delete
                        </button>
                        <button
                          className="outline"
                          disabled={busy}
                          onClick={() => setConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="text-link danger-link"
                      onClick={() => setConfirm(true)}
                    >
                      Delete photo
                    </button>
                  ))}
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
              </div>
            </div>
            <div className="comments">
              <h2>
                Comments <span>({photo.comments.length})</span>
              </h2>
              <div aria-live="polite">
                {photo.comments.length ? (
                  photo.comments.map((c) => (
                    <article key={c._id} className="comment">
                      <div className="card-meta">
                        <strong>{author(c.userId)}</strong>
                        <time dateTime={c.dateTime}>
                          {dateLabel(c.dateTime)}
                        </time>
                      </div>
                      <p>{c.comment}</p>
                    </article>
                  ))
                ) : (
                  <p>No comments yet.</p>
                )}
              </div>
              {user ? (
                <CommentForm
                  photoId={id}
                  onAdded={(c) =>
                    resource.update((p) => ({
                      ...p,
                      comments: [...p.comments, c],
                    }))
                  }
                />
              ) : (
                <Link
                  to="/login"
                  state={{ next: '/photos/' + id }}
                  className="outline"
                >
                  Log in to comment
                </Link>
              )}
            </div>
          </>
        )}
      </Feedback>
    </section>
  );
}
