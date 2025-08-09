
# Solo Arena (M1 Demo) — WebGL 3D 单机对战（Vercel 专用）

> 单机（不联机），Three.js + React + TS + Tailwind。含基础后期：Bloom / SSAO（可切换）、命中高亮、轻微屏幕抖动。支持 Vercel 一键部署。

## 一键部署（Vercel）
1. 将本仓库上传到 GitHub。
2. 打开 Vercel → **Add New Project** → 导入此仓库。
3. Framework 选择 **Vite**；Build Command: `npm run build`；Output: `dist`。
4. 首次构建完成后访问分配的域名即可。

## 本地开发
```bash
npm i
npm run dev
# 生产构建预览
npm run build
npm run preview
```

## 操作
- `WASD` 移动，`鼠标` 视角（点击场景进入 Pointer Lock），`Space` 跳跃，`Shift` 冲刺。  
- `左键` 开火，`Q/E` 技能占位（冷却 UI），`Esc` 释放鼠标。

## 画质设置
右上角齿轮进入设置：低/中/高画质，Bloom/SSAO/MotionBlur/Outline 可切换。

## 结构
- `src/game` 游戏循环、渲染、AI、战斗
- `src/app` React 路由、HUD、设置面板
- `public/assets` 素材占位（.keep）

## 许可
MIT
