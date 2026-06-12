'use client'

import type { MindMapData, MindMapBranch } from '@/lib/notes/types'

interface Props {
  data: MindMapData
}

// Branch colors (cycling)
const BRANCH_COLORS = [
  { line: '#D4A017', text: '#D4A017', bg: 'rgba(212,160,23,0.12)' },   // gold
  { line: '#3B82F6', text: '#60A5FA', bg: 'rgba(59,130,246,0.12)' },   // blue
  { line: '#F97316', text: '#FB923C', bg: 'rgba(249,115,22,0.12)' },   // saffron
  { line: '#22C55E', text: '#4ADE80', bg: 'rgba(34,197,94,0.12)'  },   // green
  { line: '#A855F7', text: '#C084FC', bg: 'rgba(168,85,247,0.12)' },   // purple
]

const W = 800
const H = 520
const CX = W / 2
const CY = H / 2
const BRANCH_R  = 170  // distance from center to branch label
const LEAF_R    = 290  // distance from center to leaf label

function polarToXY(angle: number, r: number) {
  return {
    x: CX + r * Math.cos(angle),
    y: CY + r * Math.sin(angle),
  }
}

function wrapText(text: string, maxChars = 14): string[] {
  if (text.length <= maxChars) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars && current) {
      lines.push(current)
      current = w
    } else {
      current = (current + ' ' + w).trim()
    }
  }
  if (current) lines.push(current)
  return lines
}

export default function MindMapRenderer({ data }: Props) {
  const { center, branches } = data

  if (!branches || branches.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-chanakya-text-dim text-sm">
        Mind map not yet generated for this note.
      </div>
    )
  }

  // Compute angles for each branch
  const branchCount = branches.length
  const angleStep   = (2 * Math.PI) / branchCount
  const startAngle  = -Math.PI / 2  // start from top

  // Count total leaf nodes per branch for angle spreading
  const allLeaves: { branch: MindMapBranch; bIdx: number; lIdx: number; lTotal: number }[] = []
  branches.forEach((b, bIdx) => {
    const children = b.children ?? []
    children.forEach((_, lIdx) => {
      allLeaves.push({ branch: b, bIdx, lIdx, lTotal: children.length })
    })
  })

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-3xl mx-auto"
        style={{ minWidth: 340 }}
        aria-label={`Mind map for ${center}`}
      >
        {/* Background */}
        <rect width={W} height={H} fill="transparent" />

        {/* Center node */}
        <ellipse
          cx={CX} cy={CY}
          rx={70} ry={34}
          fill="rgba(212,160,23,0.15)"
          stroke="#D4A017"
          strokeWidth={1.5}
        />
        <text
          x={CX} y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#D4A017"
          fontSize={13}
          fontFamily="'Cinzel', serif"
          fontWeight="700"
        >
          {center.length > 16 ? center.slice(0, 15) + '…' : center}
        </text>

        {/* Branches */}
        {branches.map((branch, bIdx) => {
          const bAngle  = startAngle + bIdx * angleStep
          const bPos    = polarToXY(bAngle, BRANCH_R)
          const color   = BRANCH_COLORS[bIdx % BRANCH_COLORS.length]
          const children = branch.children ?? []
          const bLabel  = wrapText(branch.label, 14)

          // Leaf angles: spread ±25° around branch angle
          const leafSpread  = Math.min(30 * (Math.PI / 180), angleStep * 0.4)
          const leafStep    = children.length > 1 ? (2 * leafSpread) / (children.length - 1) : 0
          const leafStart   = bAngle - (children.length > 1 ? leafSpread : 0)

          return (
            <g key={bIdx}>
              {/* Line: center → branch */}
              <line
                x1={CX} y1={CY}
                x2={bPos.x} y2={bPos.y}
                stroke={color.line}
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />

              {/* Branch node */}
              <rect
                x={bPos.x - 52} y={bPos.y - 18}
                width={104} height={36}
                rx={8}
                fill={color.bg}
                stroke={color.line}
                strokeWidth={1}
              />
              {bLabel.map((line, li) => (
                <text
                  key={li}
                  x={bPos.x} y={bPos.y + (li - (bLabel.length - 1) / 2) * 13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color.text}
                  fontSize={11}
                  fontFamily="sans-serif"
                  fontWeight="600"
                >
                  {line}
                </text>
              ))}

              {/* Leaf nodes */}
              {children.map((child, lIdx) => {
                const lAngle = leafStart + lIdx * leafStep
                const lPos   = polarToXY(lAngle, LEAF_R)
                const lLabel = wrapText(child, 13)

                return (
                  <g key={lIdx}>
                    {/* Line: branch → leaf */}
                    <line
                      x1={bPos.x} y1={bPos.y}
                      x2={lPos.x} y2={lPos.y}
                      stroke={color.line}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                      strokeDasharray="3,3"
                    />
                    {/* Leaf pill */}
                    <rect
                      x={lPos.x - 46} y={lPos.y - 14}
                      width={92} height={28}
                      rx={14}
                      fill="rgba(30,30,30,0.7)"
                      stroke={color.line}
                      strokeWidth={0.8}
                      strokeOpacity={0.5}
                    />
                    {lLabel.map((line, li) => (
                      <text
                        key={li}
                        x={lPos.x}
                        y={lPos.y + (li - (lLabel.length - 1) / 2) * 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#C8C8C8"
                        fontSize={10}
                        fontFamily="sans-serif"
                      >
                        {line}
                      </text>
                    ))}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
