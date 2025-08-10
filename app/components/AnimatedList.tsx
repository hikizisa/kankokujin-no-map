import React, { useEffect, useRef, useState } from 'react'

interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
  itemKey: (index: number) => string
}

interface ItemPosition {
  top: number
  left: number
  width: number
  height: number
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = '',
  itemKey
}) => {
  const listRef = useRef<HTMLDivElement>(null)
  const itemPositions = useRef<Map<string, ItemPosition>>(new Map())
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!listRef.current) return

    const items = listRef.current.children
    const newPositions = new Map<string, ItemPosition>()

    // Record current positions
    Array.from(items).forEach((item, index) => {
      const key = itemKey(index)
      const rect = item.getBoundingClientRect()
      const listRect = listRef.current!.getBoundingClientRect()
      
      newPositions.set(key, {
        top: rect.top - listRect.top,
        left: rect.left - listRect.left,
        width: rect.width,
        height: rect.height
      })
    })

    // Check if positions changed and animate
    let hasChanges = false
    Array.from(items).forEach((item, index) => {
      const key = itemKey(index)
      const oldPos = itemPositions.current.get(key)
      const newPos = newPositions.get(key)

      if (oldPos && newPos && (oldPos.top !== newPos.top || oldPos.left !== newPos.left)) {
        hasChanges = true
        const deltaX = oldPos.left - newPos.left
        const deltaY = oldPos.top - newPos.top

        // Apply transform to move item to old position
        const element = item as HTMLElement
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        element.style.transition = 'none'

        // Force reflow
        element.offsetHeight

        // Animate to new position
        element.style.transition = 'transform 300ms ease-out'
        element.style.transform = 'translate(0, 0)'

        // Clean up after animation
        setTimeout(() => {
          element.style.transition = ''
          element.style.transform = ''
        }, 300)
      }
    })

    if (hasChanges) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 300)
    }

    // Update stored positions
    itemPositions.current = newPositions
  }, [children, itemKey])

  return (
    <div ref={listRef} className={className}>
      {children}
    </div>
  )
}
