'use client';

import { useRef, useState } from 'react';

export default function Slider({ images, alt, large = false }) {
  const track = useRef(null);
  const [index, setIndex] = useState(0);

  const go = (i) => {
    const el = track.current;
    el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };

  return (
    <div className={`slider${large ? ' large' : ''}`}>
      <div
        className="slider-track"
        ref={track}
        tabIndex={images.length > 1 ? 0 : undefined}
        aria-label={`${alt} の写真`}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {images.map((src, i) => (
          <figure key={src + i}>
            <img src={src} alt={`${alt}（${i + 1}枚目）`} loading={i === 0 ? 'eager' : 'lazy'} />
          </figure>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button type="button" className="slider-btn prev" aria-label="前の写真" disabled={index === 0} onClick={() => go(index - 1)}>
            ←
          </button>
          <button type="button" className="slider-btn next" aria-label="次の写真" disabled={index === images.length - 1} onClick={() => go(index + 1)}>
            →
          </button>
          <span className="slider-count">
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}
