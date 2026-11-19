import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { api } from '../api.js';
export default function Upload({ user, loading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (loading)
    return (
      <p className="notice" role="status">
        Checking your account…
      </p>
    );
  if (!user)
    return <Navigate to="/login" state={{ next: '/upload' }} replace />;
  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const photo = await api('/photos', {
        method: 'POST',
        body: new FormData(e.currentTarget),
      });
      navigate('/photos/' + photo._id, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="form-page">
      <div className="form-panel wide">
        <Link className="back" to="/gallery">
          <Icon name="back" size={15} />
          Gallery
        </Link>
        <h1>Share a photo</h1>
        <form onSubmit={submit}>
          <label>
            Photograph
            <div className="file-picker">
              {preview ? (
                <img
                  className="preview"
                  src={preview}
                  alt="Selected photo preview"
                />
              ) : (
                <Icon name="upload" size={28} />
              )}
              <span>{file?.name || 'Choose a photograph'}</span>
              <small>JPEG, PNG or WebP · Up to 8 MB</small>
              <input
                type="file"
                name="photo"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const selected = e.target.files[0];
                  if (selected?.size > 8 * 1024 * 1024) {
                    e.target.value = '';
                    setFile(null);
                    setError('Choose an image no larger than 8 MB.');
                  } else {
                    setFile(selected || null);
                    setError('');
                  }
                }}
              />
            </div>
          </label>
          <label>
            Title
            <input
              required
              name="title"
              maxLength={100}
              placeholder="Give this memory a name"
            />
          </label>
          <label>
            Caption <small>(optional)</small>
            <textarea
              name="description"
              maxLength={2000}
              rows="4"
              placeholder="Tell the story behind the photo"
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            <Icon name="upload" />
            {busy ? 'Sharing…' : 'Share photo'}
          </button>
        </form>
      </div>
    </section>
  );
}
