import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { author, useResource } from '../api.js';
import Feedback from '../components/Feedback.jsx';
import PhotoCard from '../components/PhotoCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Gallery() {
  const photos = useResource('/photos');
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const matches = photos.data?.filter(p => [p.title, p.description, author(p.userId)].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="page"><div className="section-head"><div><div className="eyebrow"><span className="rule"/>Community collection</div><h1>The gallery</h1></div><Link className="primary" to="/upload"><Icon name="plus"/>Share a photo</Link></div>
    <div className="tools"><label className="search"><Icon name="search"/><input aria-label="Search photos" type="search" placeholder="Search photos or photographers" value={query} onChange={e => setQuery(e.target.value)}/></label>
    <div className="view-toggle" role="group" aria-label="Gallery display">{['grid','list'].map(v => <button key={v} type="button" aria-pressed={view === v} aria-label={v + ' view'} onClick={() => setView(v)}><Icon name={v}/></button>)}</div></div>
    <Feedback resource={photos}>{matches?.length ? <div className={'photo-' + view}>{matches.map(p => <PhotoCard key={p._id} photo={p}/>)}</div> :
      <div className="notice">{query ? <>No photos match your search. <button className="text-link" onClick={() => setQuery('')}>Clear search</button></> : <>The gallery is empty. <Link to="/upload">Share the first photo</Link></>}</div>}</Feedback>
  </section>;
}
