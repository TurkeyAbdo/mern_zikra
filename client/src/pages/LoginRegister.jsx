import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function LoginRegister({ user, onAuthenticated }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { state } = useLocation();
  const next =
    typeof state?.next === 'string' &&
    /^\/(upload|photos\/[\da-f]{24})$/.test(state.next)
      ? state.next
      : '/gallery';
  if (user) return <Navigate to={next} replace />;
  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget));
      const profile = await api('/auth/' + (register ? 'register' : 'login'), {
        method: 'POST',
        body,
      });
      onAuthenticated(profile);
      nav(next, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="form-page">
      <div className="form-panel">
        <div className="eyebrow">
          <span className="rule" />
          Your journal
        </div>
        <h1>{register ? 'Create an account' : 'Welcome back'}</h1>
        <p>
          {next === '/upload'
            ? 'Log in or create an account to share your photo.'
            : 'Join the conversation and share the moments you remember.'}
        </p>
        <form key={register} onSubmit={submit}>
          {register && (
            <div className="field-pair">
              <label>
                First name
                <input
                  required
                  name="firstName"
                  maxLength={60}
                  autoComplete="given-name"
                />
              </label>
              <label>
                Last name
                <input
                  required
                  name="lastName"
                  maxLength={60}
                  autoComplete="family-name"
                />
              </label>
            </div>
          )}
          <label>
            Email
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              maxLength={254}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              name="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              minLength={register ? 8 : undefined}
            />
          </label>
          {register && (
            <small>Use at least 8 characters and at most 72 bytes.</small>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}
          </button>
        </form>
        <p className="switch">
          {register ? 'Already have an account? ' : 'New to Alzikrayat? '}
          <button
            className="text-link"
            disabled={busy}
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </div>
    </section>
  );
}
