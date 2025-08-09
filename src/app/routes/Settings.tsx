
import { Link } from 'react-router-dom'
import { useUI } from '../store/ui'

export default function Settings(){
  const ui = useUI()
  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">设置</h2>
        <Link to="/" className="button bg-white/10">返回</Link>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 panel">
          <h3 className="font-semibold mb-2">画质</h3>
          <div className="flex gap-2">
            {(['low','medium','high'] as const).map(q => (
              <button key={q} className={`button ${ui.quality===q?'':'bg-white/10'}`} onClick={()=>ui.set({quality:q})}>{q}</button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ui.bloom} onChange={e=>ui.set({bloom:e.target.checked})}/>
              Bloom
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ui.ssao} onChange={e=>ui.set({ssao:e.target.checked})}/>
              SSAO
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={ui.outline} onChange={e=>ui.set({outline:e.target.checked})}/>
              Outline
            </label>
          </div>
        </div>
        <div className="p-4 panel">
          <h3 className="font-semibold mb-2">控制</h3>
          <label className="block text-sm text-white/70 mb-1">鼠标灵敏度</label>
          <input type="range" min="0.0008" max="0.004" step="0.0001" value={ui.mouseSensitivity}
            onChange={e=>ui.set({mouseSensitivity: Number(e.target.value)})} className="w-full"/>
          <p className="text-xs text-white/50 mt-1">{ui.mouseSensitivity.toFixed(4)}</p>
        </div>
      </div>
    </div>
  )
}
