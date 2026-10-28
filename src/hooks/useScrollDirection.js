import { useState, useEffect, useRef } from 'react'

export function useScrollDirection({ threshold = 10 } = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0

          // At or near the top of the viewport: always visible
          if (currentScrollY <= 20) {
            setIsVisible(true)
            lastScrollY.current = currentScrollY
            ticking.current = false
            return
          }

          const diff = currentScrollY - lastScrollY.current

          // Scrolling down past threshold -> HIDE
          if (diff > threshold) {
            setIsVisible(false)
          }
          // Micro-scrolling up (even slightly) -> SHOW IMMEDIATELY
          else if (diff < -4) {
            setIsVisible(true)
          }

          lastScrollY.current = currentScrollY
          ticking.current = false
        })

        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isVisible
}
