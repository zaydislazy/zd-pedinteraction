import { useEffect, useState } from 'react'

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

export function useStageScale() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const next = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return scale
}
