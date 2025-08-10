'use client'

import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react'

interface AnimatedListProps<T> {
  items: T[]
  getKey: (item: T) => string | number
  className?: string
  renderItem: (item: T, index: number) => React.ReactNode
  exitDuration?: number
}

interface ItemState<T> {
  item: T
  key: string | number
  status: 'entering' | 'present' | 'exiting'
}

export function AnimatedList<T>({
  items,
  getKey,
  className = '',
  renderItem,
  exitDuration = 300
}: AnimatedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousPositions = useRef<Map<string | number, DOMRect>>(new Map())
  const [renderedItems, setRenderedItems] = useState<ItemState<T>[]>([])
  const exitTimeouts = useRef<Map<string | number, NodeJS.Timeout>>(new Map())
  const isFirstRender = useRef(true)

  // Capture positions before re-render
  const capturePositions = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll('[data-flip-key]')) as HTMLElement[]
    const positions = new Map<string | number, DOMRect>()
    
    elements.forEach(element => {
      const key = element.getAttribute('data-flip-key')
      if (key) {
        // Only capture if element is not currently animating
        const computedStyle = getComputedStyle(element)
        if (!computedStyle.transform || computedStyle.transform === 'none') {
          positions.set(key, element.getBoundingClientRect())
        }
      }
    })
    
    previousPositions.current = positions
  }, [])

  // Update rendered items when props change
  useEffect(() => {
    // Capture positions before state change
    if (!isFirstRender.current) {
      capturePositions()
    }

    const currentKeys = new Set(items.map(getKey))
    
    setRenderedItems(prevRenderedItems => {
      const prevMap = new Map(prevRenderedItems.map(state => [state.key, state]))
      const newRenderedItems: ItemState<T>[] = []

      // Handle existing items
      for (const state of prevRenderedItems) {
        if (currentKeys.has(state.key)) {
          // Item still exists - find updated data
          const updatedItem = items.find(item => getKey(item) === state.key)!
          newRenderedItems.push({
            ...state,
            item: updatedItem,
            status: state.status === 'entering' ? 'present' : state.status
          })
        } else if (state.status !== 'exiting') {
          // Item removed - mark as exiting
          newRenderedItems.push({
            ...state,
            status: 'exiting'
          })
          
          // Clear any existing timeout for this key
          const existingTimeout = exitTimeouts.current.get(state.key)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }
          
          // Schedule removal
          const timeoutId = setTimeout(() => {
            setRenderedItems(current => 
              current.filter(s => s.key !== state.key)
            )
            exitTimeouts.current.delete(state.key)
          }, exitDuration)
          
          exitTimeouts.current.set(state.key, timeoutId)
        } else {
          // Keep exiting items
          newRenderedItems.push(state)
        }
      }

      // Add new items
      for (const item of items) {
        const key = getKey(item)
        if (!prevMap.has(key)) {
          newRenderedItems.push({
            item,
            key,
            status: 'entering'
          })
        }
      }

      // Sort to maintain order (present items first, then exiting)
      const itemOrder = new Map(items.map((item, index) => [getKey(item), index]))
      newRenderedItems.sort((a, b) => {
        const aOrder = itemOrder.has(a.key) ? itemOrder.get(a.key)! : Number.MAX_SAFE_INTEGER
        const bOrder = itemOrder.has(b.key) ? itemOrder.get(b.key)! : Number.MAX_SAFE_INTEGER
        return aOrder - bOrder
      })

      return newRenderedItems
    })

    isFirstRender.current = false
  }, [items, getKey, exitDuration, capturePositions])

  // FLIP animation effect
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || isFirstRender.current) return

    const elements = Array.from(container.querySelectorAll('[data-flip-key]')) as HTMLElement[]
    
    // Apply FLIP animations for moved items
    elements.forEach(element => {
      const key = element.getAttribute('data-flip-key')
      if (!key) return

      // Skip if element is already animating
      const computedStyle = getComputedStyle(element)
      if (computedStyle.transform && computedStyle.transform !== 'none') {
        return
      }

      const currentPos = element.getBoundingClientRect()
      const previousPos = previousPositions.current.get(key)

      if (currentPos && previousPos) {
        const deltaX = previousPos.left - currentPos.left
        const deltaY = previousPos.top - currentPos.top

        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          // FLIP: First (invert)
          element.style.transform = `translate(${deltaX}px, ${deltaY}px)`
          element.style.transition = 'none'
          element.style.willChange = 'transform'

          // Force reflow
          element.offsetHeight

          // FLIP: Last (play)
          requestAnimationFrame(() => {
            element.style.transition = 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)'
            element.style.transform = 'translate(0, 0)'
            
            setTimeout(() => {
              element.style.transition = ''
              element.style.transform = ''
              element.style.willChange = ''
            }, 300)
          })
        }
      }
    })
  })

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Array.from(exitTimeouts.current.values()).forEach(clearTimeout)
      exitTimeouts.current.clear()
    }
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {renderedItems.map((state, index) => (
        <div
          key={state.key}
          data-flip-key={state.key}
          className={`animated-list-item ${
            state.status === 'entering' ? 'animate-fade-in' : 
            state.status === 'exiting' ? 'animate-fade-out' : ''
          }`}
          style={{
            animationFillMode: 'both',
            animationDelay: state.status === 'entering' ? `${index * 30}ms` : '0ms'
          }}
        >
          {renderItem(state.item, index)}
        </div>
      ))}
    </div>
  )
}
