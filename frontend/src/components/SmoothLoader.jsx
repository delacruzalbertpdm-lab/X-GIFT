import React from 'react';

/**
 * SmoothLoader - A high-polish Apple-aesthetic loading component.
 * Features cute rhythmic bouncing hamster mascot, ambient ripple glow,
 * silky smooth rotating dual-ring spinner, and animated loading dots.
 */
export default function SmoothLoader({
  fullScreen = false,
  message = 'Loading...',
  subtext = '',
  size = 'md',
  transparent = false,
  className = '',
  style = {},
}) {
  if (fullScreen) {
    return (
      <div className={`smooth-loader-fullscreen animate-fade-in ${className}`} style={style}>
        <div className="smooth-loader-card">
          <div className="smooth-loader-avatar-container">
            <div className="smooth-loader-halo-ring" />
            <div className="smooth-loader-pulse-ring" />
            <img
              src="/hamster_hero.png"
              alt="Hamster Mascot"
              className="smooth-loader-avatar animate-hamster-bounce"
            />
          </div>

          <h3 className="smooth-loader-title">
            {message}
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </h3>

          {subtext && <p className="smooth-loader-subtext">{subtext}</p>}

          <div className="shimmer-bar" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`smooth-loader-inline animate-fade-in ${transparent ? 'is-transparent' : ''} ${className}`}
      style={style}
    >
      <div className="smooth-loader-inline-inner">
        <div className={`smooth-loader-spinner-box size-${size}`}>
          <div className="smooth-loader-spinner-ring" />
          <img
            src="/hamster_hero.png"
            alt="Hamster"
            className="smooth-loader-mini-avatar animate-hamster-bounce"
          />
        </div>

        <div className="smooth-loader-inline-copy">
          <div className="smooth-loader-inline-title">
            {message}
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
          {subtext && <div className="smooth-loader-inline-subtext">{subtext}</div>}
        </div>
      </div>

      <div className="shimmer-bar" style={{ width: size === 'sm' ? '100px' : '150px' }} />
    </div>
  );
}
