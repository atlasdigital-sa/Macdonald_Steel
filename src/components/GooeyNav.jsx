import { useRef, useEffect, useState } from 'react'
import './GooeyNav.css'

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onItemClick,
}) => {
  const containerRef = useRef(null)
  const navRef = useRef(null)
  const filterRef = useRef(null)
  const textRef = useRef(null)
  const timeoutRef = useRef([])
  const [activeIndex, setActiveIndex] = useState(controlledActiveIndex ?? initialActiveIndex)

  const noise = (n = 1) => n / 2 - Math.random() * n

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180)
    return [distance * Math.cos(angle), distance * Math.sin(angle)]
  }

  const createParticle = (i, t, d, r) => {
    const rotate = noise(r / 10)
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    }
  }

  const clearParticles = () => {
    timeoutRef.current.forEach(clearTimeout)
    timeoutRef.current = []
    filterRef.current?.querySelectorAll('.particle').forEach(particle => particle.remove())
  }

  const makeParticles = element => {
    const d = particleDistances
    const r = particleR
    const bubbleTime = animationTime * 2 + timeVariance
    element.style.setProperty('--time', `${bubbleTime}ms`)

    for (let i = 0; i < particleCount; i += 1) {
      const t = animationTime * 2 + noise(timeVariance * 2)
      const p = createParticle(i, t, d, r)
      element.classList.remove('active')

      const creationTimer = window.setTimeout(() => {
        const particle = document.createElement('span')
        const point = document.createElement('span')
        particle.classList.add('particle')
        particle.style.setProperty('--start-x', `${p.start[0]}px`)
        particle.style.setProperty('--start-y', `${p.start[1]}px`)
        particle.style.setProperty('--end-x', `${p.end[0]}px`)
        particle.style.setProperty('--end-y', `${p.end[1]}px`)
        particle.style.setProperty('--time', `${p.time}ms`)
        particle.style.setProperty('--scale', `${p.scale}`)
        particle.style.setProperty('--color', `var(--color-${p.color}, var(--red))`)
        particle.style.setProperty('--rotate', `${p.rotate}deg`)
        point.classList.add('point')
        particle.appendChild(point)
        element.appendChild(particle)

        requestAnimationFrame(() => element.classList.add('active'))
        const removalTimer = window.setTimeout(() => particle.remove(), t)
        timeoutRef.current.push(removalTimer)
      }, 30)
      timeoutRef.current.push(creationTimer)
    }
  }

  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current || !element) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const position = element.getBoundingClientRect()
    const styles = {
      left: `${position.x - containerRect.x}px`,
      top: `${position.y - containerRect.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
    }
    Object.assign(filterRef.current.style, styles)
    Object.assign(textRef.current.style, styles)
    textRef.current.innerText = element.innerText
  }

  const handleClick = (event, item, index) => {
    event.preventDefault()
    const listItem = event.currentTarget.closest('li')

    if (activeIndex !== index && listItem) {
      setActiveIndex(index)
      updateEffectPosition(listItem)
      clearParticles()

      if (textRef.current) {
        textRef.current.classList.remove('active')
        void textRef.current.offsetWidth
        textRef.current.classList.add('active')
      }

      if (filterRef.current) makeParticles(filterRef.current)
    }

    onItemClick?.(item, index)
  }

  useEffect(() => {
    if (controlledActiveIndex !== undefined) setActiveIndex(controlledActiveIndex)
  }, [controlledActiveIndex])

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return undefined
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex]
    if (activeLi) {
      updateEffectPosition(activeLi)
      textRef.current?.classList.add('active')
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex]
      if (currentActiveLi) updateEffectPosition(currentActiveLi)
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [activeIndex])

  useEffect(() => () => clearParticles(), [])

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav aria-label="Primary navigation">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li key={item.id} className={activeIndex === index ? 'active' : ''}>
              <a
                href={item.href}
                aria-current={activeIndex === index ? 'page' : undefined}
                onClick={event => handleClick(event, item, index)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} aria-hidden="true" />
      <span className="effect text" ref={textRef} aria-hidden="true" />
    </div>
  )
}

export default GooeyNav
