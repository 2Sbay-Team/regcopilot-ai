import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Database, Server, HardDrive, Globe } from 'lucide-react'

interface LineageNode {
  id: string
  type: 'source' | 'process' | 'storage' | 'transfer'
  name: string
  jurisdiction?: string
  timestamp: string
}

interface LineageEdge {
  from: string
  to: string
  transformation?: string
}

interface LineageGraphProps {
  nodes: LineageNode[]
  edges: LineageEdge[]
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'source':
      return Database
    case 'process':
      return Server
    case 'storage':
      return HardDrive
    case 'transfer':
      return Globe
    default:
      return Database
  }
}

const getNodeColor = (type: string) => {
  switch (type) {
    case 'source':
      return 'hsl(var(--primary))'
    case 'process':
      return 'hsl(var(--accent))'
    case 'storage':
      return 'hsl(var(--secondary))'
    case 'transfer':
      return 'hsl(var(--destructive))'
    default:
      return 'hsl(var(--muted-foreground))'
  }
}

// Custom node component
const CustomNode = ({ data }: { data: any }) => {
  const Icon = data.icon
  
  return (
    <div
      className="px-4 py-3 rounded-lg border-2 bg-background shadow-lg min-w-[180px]"
      style={{ borderColor: data.color }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" style={{ color: data.color }} />
        <div className="font-semibold text-sm truncate">{data.label}</div>
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <div className="capitalize">{data.type}</div>
        {data.jurisdiction && (
          <div className="font-medium">{data.jurisdiction}</div>
        )}
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

export const LineageGraph = ({ nodes: lineageNodes, edges: lineageEdges }: LineageGraphProps) => {
  // Transform lineage data into react-flow format
  const initialNodes: Node[] = useMemo(() => {
    const uniqueNodes = new Map<string, LineageNode>()
    lineageNodes.forEach(node => {
      if (!uniqueNodes.has(node.id)) {
        uniqueNodes.set(node.id, node)
      }
    })

    return Array.from(uniqueNodes.values()).map((node, index) => {
      const angle = (index * 2 * Math.PI) / uniqueNodes.size
      const radius = 250
      
      return {
        id: node.id,
        type: 'custom',
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle),
        },
        data: {
          label: node.name,
          type: node.type,
          jurisdiction: node.jurisdiction,
          icon: getNodeIcon(node.type),
          color: getNodeColor(node.type),
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }
    })
  }, [lineageNodes])

  const initialEdges: Edge[] = useMemo(() => {
    return lineageEdges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      label: edge.transformation || undefined,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      style: {
        strokeWidth: 2,
        stroke: 'hsl(var(--primary))',
      },
      labelStyle: {
        fill: 'hsl(var(--foreground))',
        fontSize: 10,
        fontWeight: 600,
      },
      labelBgStyle: {
        fill: 'hsl(var(--background))',
        fillOpacity: 0.9,
      },
    }))
  }, [lineageEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onInit = useCallback(() => {
    // Auto-layout could be added here if needed
  }, [])

  if (lineageNodes.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground border rounded-lg bg-muted/20">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No data flows tracked yet</p>
          <p className="text-sm">Start by tracking your first data flow</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-muted/5"
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background className="bg-muted/20" />
        <Controls className="bg-background border rounded-lg" />
        <MiniMap
          className="bg-background border rounded-lg"
          nodeColor={(node) => node.data.color as string}
          maskColor="hsl(var(--muted) / 0.3)"
        />
      </ReactFlow>
    </div>
  )
}