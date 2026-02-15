import { useEffect, useRef, useState, useMemo } from 'react'
import type { JSX } from 'react'
import type { GitObject, CommitObject, TreeObject, TagObject } from './ObjectDatabase'

interface ObjectGraphProps {
  objects: Array<GitObject | CommitObject | TreeObject | TagObject>
  selectedHash?: string
}

interface NodePosition {
  x: number
  y: number
  hash: string
  type: 'commit' | 'tree' | 'blob' | 'tag'
  depth: number
}

export function ObjectGraph({
  objects,
  selectedHash
}: ObjectGraphProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Layout Constants
  const STATIC_PADDING = { x: 50, y: 50 }
  const NODE_RADIUS = 18
  const ROW_HEIGHT = 60
  const COL_WIDTH_COMMIT = 100
  const COL_START_OBJECTS = 250
  const DEPTH_INDENT = 120

  // 1. Calculate Layout (Pure calculation, no side effects)
  const nodePositions = useMemo(() => {
    const positionMap = new Map<string, NodePosition>()
    const objectMap = new Map(objects.map((o) => [o.hash, o]))
    const depthMap = new Map<string, number>()
    const queue: { hash: string; depth: number }[] = []
    const visited = new Set<string>()

    // Commits -> Root Trees
    const commits = objects.filter((o) => o.type === 'commit') as CommitObject[]
    commits.forEach((c) => {
      if (c.tree) queue.push({ hash: c.tree, depth: 0 })
    })

    // BFS for depth
    while (queue.length > 0) {
      const { hash, depth } = queue.shift()!
      if (visited.has(hash)) continue
      visited.add(hash)
      if (!depthMap.has(hash)) depthMap.set(hash, depth)
      
      const obj = objectMap.get(hash)
      if (obj && obj.type === 'tree') {
        ;(obj as TreeObject).entries.forEach((entry) => {
          queue.push({ hash: entry.hash, depth: depth + 1 })
        })
      }
    }

    // Assign Coordinates
    commits.forEach((commit, index) => {
      positionMap.set(commit.hash, {
        x: COL_WIDTH_COMMIT,
        y: index * ROW_HEIGHT,
        hash: commit.hash,
        type: 'commit',
        depth: -1
      })
    })

    const trees = objects.filter((o) => o.type === 'tree')
    trees.forEach((tree, index) => {
      const depth = depthMap.get(tree.hash) ?? 0
      positionMap.set(tree.hash, {
        x: COL_START_OBJECTS + depth * DEPTH_INDENT,
        y: index * ROW_HEIGHT,
        hash: tree.hash,
        type: 'tree',
        depth
      })
    })

    const blobs = objects.filter((o) => o.type === 'blob')
    blobs.forEach((blob, index) => {
      const startY = trees.length * ROW_HEIGHT
      const depth = depthMap.get(blob.hash) ?? 1
      positionMap.set(blob.hash, {
        x: COL_START_OBJECTS + depth * DEPTH_INDENT,
        y: startY + index * ROW_HEIGHT,
        hash: blob.hash,
        type: 'blob',
        depth
      })
    })

    const tags = objects.filter((o) => o.type === 'tag') as TagObject[]
    tags.forEach((tag, index) => {
      const targetObj = objectMap.get(tag.objectHash)
      let baseX = COL_START_OBJECTS
      let baseY = index * ROW_HEIGHT
      if (targetObj) {
        const targetPos = positionMap.get(targetObj.hash)
        if (targetPos) {
          baseX = targetPos.x
          baseY = targetPos.y + 30 + index * 20
        }
      }
      positionMap.set(tag.hash, {
        x: baseX,
        y: baseY,
        hash: tag.hash,
        type: 'tag',
        depth: 0
      })
    })

    return positionMap
  }, [objects])

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 2. Render Canvas (Runs once per change)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const displayWidth = containerSize.width || canvas.clientWidth
    const displayHeight = containerSize.height || canvas.clientHeight

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    ctx.translate(STATIC_PADDING.x, STATIC_PADDING.y)

    // Helper: Draw Bezier
    const drawConnection = (x1: number, y1: number, x2: number, y2: number, color: string, isHighlighted: boolean) => {
      ctx.strokeStyle = isHighlighted ? '#ffffff' : color
      ctx.lineWidth = isHighlighted ? 3 : 1.5
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      const cp1x = x1 + (x2 - x1) / 2
      ctx.bezierCurveTo(cp1x, y1, cp1x, y2, x2, y2)
      ctx.stroke()
    }

    // Draw Connections
    objects.forEach(obj => {
        if (obj.type === 'commit') {
            const commit = obj as CommitObject
            const fromPos = nodePositions.get(commit.hash)
            
            // To Tree
            const toPos = nodePositions.get(commit.tree)
            if (fromPos && toPos) {
                const isHighlighted = fromPos.hash === selectedHash || toPos.hash === selectedHash
                drawConnection(fromPos.x + NODE_RADIUS, fromPos.y, toPos.x - NODE_RADIUS, toPos.y, 'rgba(100, 100, 100, 0.4)', isHighlighted)
            }

            // To Parent
            commit.parent?.forEach(pHash => {
                const parentPos = nodePositions.get(pHash)
                if (fromPos && parentPos) {
                    const isHighlighted = fromPos.hash === selectedHash || parentPos.hash === selectedHash
                    ctx.strokeStyle = isHighlighted ? '#ffffff' : 'rgba(59, 130, 246, 0.3)'
                    ctx.lineWidth = isHighlighted ? 3 : 1.5
                    ctx.beginPath()
                    ctx.moveTo(fromPos.x, fromPos.y - NODE_RADIUS)
                    ctx.lineTo(parentPos.x, parentPos.y + NODE_RADIUS)
                    ctx.stroke()
                }
            })
        } else if (obj.type === 'tree') {
            const tree = obj as TreeObject
            const fromPos = nodePositions.get(tree.hash)
            if (fromPos && tree.entries) {
                tree.entries.forEach(entry => {
                    const toPos = nodePositions.get(entry.hash)
                    if (toPos) {
                        const isHighlighted = fromPos.hash === selectedHash || toPos.hash === selectedHash
                        drawConnection(fromPos.x + NODE_RADIUS, fromPos.y, toPos.x - NODE_RADIUS, toPos.y, 'rgba(100, 100, 100, 0.25)', isHighlighted)
                    }
                })
            }
        }
    })

    // Draw Nodes
    nodePositions.forEach((pos) => {
      const isSelected = pos.hash === selectedHash

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2)

      if (pos.type === 'commit') ctx.fillStyle = isSelected ? '#3b82f6' : '#2563eb'
      else if (pos.type === 'tree') ctx.fillStyle = isSelected ? '#10b981' : '#059669'
      else if (pos.type === 'tag') ctx.fillStyle = isSelected ? '#8b5cf6' : '#7c3aed'
      else ctx.fillStyle = isSelected ? '#f59e0b' : '#d97706'
      
      ctx.fill()
      if (isSelected) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
      
      ctx.fillStyle = '#fff'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(pos.hash.substring(0, 6), pos.x, pos.y + NODE_RADIUS + 14)
    })

    // Headers
    ctx.fillStyle = '#9ca3af'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('COMMITS', COL_WIDTH_COMMIT, -20)
    ctx.fillText('ROOT TREES', COL_START_OBJECTS, -20)
    ctx.fillText('SUB TREES / FILES', COL_START_OBJECTS + DEPTH_INDENT * 1.5, -20)

  }, [objects, selectedHash, nodePositions, containerSize])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#1e1e1e]">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-[#252526] border border-gray-700 rounded p-3 text-xs text-gray-400 shadow-xl pointer-events-none opacity-80">
        <p className="mb-2 font-semibold">Git Objects:</p>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Commit</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span>Tree (Folder)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
          <span>Blob (File)</span>
        </div>
      </div>
    </div>
  )
}