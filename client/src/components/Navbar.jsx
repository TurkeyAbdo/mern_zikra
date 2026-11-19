import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';
export default function Navbar({ user, loading, onLogout, loggingOut }) {
  return <header className="top"><div className="nav-inner">
    <Link className="brand" to="/" aria-label="Alzikrayat home"><img width="38" height="38" src="/mark.svg" alt=""/>Alzikrayat</Link>
    <nav aria-label="Main navigation"><NavLink to="/" end>Home</NavLink><NavLink to="/gallery">Gallery</NavLink></nav>
    <div className="account">{user ? <><span>Hi {user.firstName}</span><button className="outline small" onClick={onLogout} disabled={loggingOut}>Logout</button></> :
      <Link className="outline small" to="/login"><Icon name="user" size={16}/>{loading ? 'Account' : 'Please Login'}</Link>}</div>
  </div></header>;
}
