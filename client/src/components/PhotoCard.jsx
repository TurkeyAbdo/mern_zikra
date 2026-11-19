import React from 'react';
import { Link } from 'react-router-dom';
import { author, dateLabel, photoUrl } from '../api.js';
export default function PhotoCard({ photo }) {
  return (
    <Link className="photo-card" to={'/photos/' + photo._id}>
      <div className="card-image">
        <img loading="lazy" src={photoUrl(photo)} alt={photo.title} />
      </div>
      <div className="card-copy">
        <div className="card-meta">
          <span>{author(photo.userId)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={photo.dateTime}>{dateLabel(photo.dateTime)}</time>
        </div>
        <h3>{photo.title}</h3>
        <p className="card-description">{photo.description}</p>
      </div>
    </Link>
  );
}
