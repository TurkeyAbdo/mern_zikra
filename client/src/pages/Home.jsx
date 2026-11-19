import React from 'react';
import { Link } from 'react-router-dom';
import { useResource } from '../api.js';
import PhotoCard from '../components/PhotoCard.jsx';
import Feedback from '../components/Feedback.jsx';
import Icon from '../components/Icon.jsx';

export default function Home() {
  const photos = useResource('/photos');
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="rule" />A shared photo journal
          </div>
          <h1>
            Memories,
            <br />
            <em>in focus.</em>
          </h1>
          <p>
            Every photograph holds a story. Discover moments from the community
            and share one of your own.
          </p>
          <div className="actions">
            <Link className="primary" to="/gallery">
              <Icon name="grid" size={17} />
              Explore gallery
            </Link>
            <Link className="outline" to="/upload">
              <Icon name="plus" size={17} />
              Share a photo
            </Link>
          </div>
        </div>
        <figure className="hero-photo">
          <img
            src="/nile.jpg"
            alt="A wooden sailboat on the Nile at sunset"
            fetchPriority="high"
          />
          <figcaption>
            <Icon name="pin" size={15} />
            The Nile, Sudan
          </figcaption>
        </figure>
      </section>
      <section className="recent">
        <div className="section-head">
          <div>
            <div className="eyebrow">
              <span className="rule" />
              From the community
            </div>
            <h2>Recent memories</h2>
          </div>
          <Link className="text-link" to="/gallery">
            View all photos
          </Link>
        </div>
        <Feedback resource={photos}>
          {photos.data?.length ? (
            <div className="photo-grid">
              {photos.data.slice(0, 3).map((p) => (
                <PhotoCard key={p._id} photo={p} />
              ))}
            </div>
          ) : (
            <p className="notice">
              The journal is ready for its first photo.{' '}
              <Link to="/upload">Share a memory</Link>
            </p>
          )}
        </Feedback>
      </section>
    </>
  );
}
