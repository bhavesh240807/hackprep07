import { useEffect, useRef } from 'react'

const STAR_COUNT = 180
const SHOOTING_STAR_COUNT = 4

export default function StarField() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Generate static stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div')
      star.className = 'star-dot'
      const size = Math.random() < 0.7 ? 2 : Math.random() < 0.5 ? 3 : 4
      const duration = 2 + Math.random() * 4
      const delay = Math.random() * 5
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        opacity: ${0.3 + Math.random() * 0.7};
      `
      container.appendChild(star)
    }

    // Generate shooting stars
    for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
      const star = document.createElement('div')
      star.className = 'shooting-star'
      const width = 60 + Math.random() * 100
      const duration = 3 + Math.random() * 6
      const delay = Math.random() * 15
      star.style.cssText = `
        left: ${10 + Math.random() * 60}%;
        top: ${5 + Math.random() * 40}%;
        width: ${width}px;
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        animation-iteration-count: infinite;
        opacity: 0;
      `
      container.appendChild(star)
    }

    return () => {
      while (container.firstChild) container.removeChild(container.firstChild)
    }
  }, [])

  return (
    <div className="space-bg">
      <div className="star-layer" ref={containerRef} />
      <div className="scanline-sweep" />
    </div>
  )
}
