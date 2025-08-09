
import { Link } from 'react-router-dom'

export default function Menu(){
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-[680px] p-8 panel">
        <h1 className="text-3xl font-bold mb-2">Solo Arena</h1>
        <p className="text-white/70 mb-6">单机 3D 对战（M1 Demo）</p>
        <div className="flex gap-3">
          <Link to="/play" className="button">开始游戏</Link>
          <Link to="/settings" className="button bg-white/10">设置</Link>
          <a className="button bg-white/10" href="https://threejs.org/" target="_blank" rel="noreferrer">Three.js</a>
        </div>
        <p className="mt-6 text-xs text-white/40">提示：进入游戏画面后点击以锁定鼠标，Esc 释放。</p>
      </div>
    </div>
  )
}
