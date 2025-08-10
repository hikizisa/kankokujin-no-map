import { useRef, useEffect } from 'react'

interface ElementPosition {
  top: number
  left: number
  width: number
  height: number
}

export function useFLIPAnimation(dependencies: any[]) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousPositions = useRef<Map<string, DOMRect>>(new Map())
  const previousDisplayStyle = useRef<string | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll('[data-flip-key]')) as HTMLElement[]
    const currentPositions = new Map<string, DOMRect>()
    
    // Check if display style changed (assuming it's in dependencies)
    const currentDisplayStyle = dependencies.find(dep => 
      typeof dep === 'string' && ['card', 'thumbnail', 'minimal'].includes(dep)
    )
    const displayStyleChanged = currentDisplayStyle && currentDisplayStyle !== previousDisplayStyle.current

    // First: Record current positions
    elements.forEach(element => {
      const key = element.getAttribute('data-flip-key')
      if (key) {
        currentPositions.set(key, element.getBoundingClientRect())
      }
    })

    // If display style changed, trigger appearing animation
    if (displayStyleChanged) {
      elements.forEach((element, index) => {
        // Reset any existing transforms
        element.style.transform = ''
        element.style.transition = ''
        
        // Add appearing animation class
        element.classList.remove('animate-fade-in')
        element.style.animationDelay = `${index * 50}ms`
        element.style.animationFillMode = 'both'
        
        // Force reflow and add animation
        element.offsetHeight
        element.classList.add('animate-fade-in')
      })
    }
    // If we have previous positions and display style didn't change, animate position differences
    else if (previousPositions.current.size > 0) {
      elements.forEach(element => {
        const key = element.getAttribute('data-flip-key')
        if (!key) return

        const currentPos = currentPositions.get(key)
        const previousPos = previousPositions.current.get(key)
        
        if (currentPos && previousPos) {
          const deltaX = previousPos.left - currentPos.left
          const deltaY = previousPos.top - currentPos.top

          // Only animate if there's a significant position change
          if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
            // Invert: Move element to previous position
            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
            element.style.transition = 'none'

            // Play: Animate to current position
            requestAnimationFrame(() => {
              element.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
              element.style.transform = 'translate(0, 0)'
              
              // Clean up after animation
              setTimeout(() => {
                element.style.transition = ''
                element.style.transform = ''
              }, 300)
            })
          }
        }
      })
    }

    // Last: Store current positions and display style for next time
    previousPositions.current = currentPositions
    previousDisplayStyle.current = currentDisplayStyle
  }, dependencies)

  return containerRef
}
