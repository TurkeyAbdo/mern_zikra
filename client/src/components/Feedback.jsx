import React from 'react';
export default function Feedback({ resource, children }) {
  if (resource.loading) return <div className="notice" role="status">Loading photos…</div>;
  if (resource.error) return <div className="notice" role="alert"><p>{resource.error}</p><button className="outline" onClick={resource.retry}>Try again</button></div>;
  return children;
}
