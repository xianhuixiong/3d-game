
import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { startGame, stopGame, GameAPI } from '@game/core/game'

export default function Play(){
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<GameAPI | null>(null)

  useEffect(()=>{
    if(containerRef.current){
      apiRef.current = startGame(containerRef.current)
    }
    return ()=>{
      if(apiRef.current) stopGame(apiRef.current)
      apiRef.current = null
    }
  },[])

  return (
    <div className="min-h-screen">
      <div className="absolute top-3 left-3 z-50 flex gap-2">
        <Link to="/" className="button bg-white/10">退出</Link>
      </div>
      <div ref={containerRef} className="w-screen h-screen"></div>
    </div>
  )
}
