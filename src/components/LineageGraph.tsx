import { useCallback, useMemo, useState } from 'react'
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
import dagre from 'dagre'
import { Database, Server, HardDrive, Globe, LayoutGrid, Network, Circle as CircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  onNodeClick?: (node: LineageNode) => void
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

type LayoutType = 'hierarchical' | 'force' | 'circular'

// Hierarchical layout using dagre
const getHierarchicalLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ 
    rankdir: 'LR', // Left to right
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 40,
      },
    }
  })
}

// Force-directed layout (grid-based approximation)
const getForceLayout = (nodes: Node[], edges: Edge[]): Node[] => {
  // Create a simple force-directed layout using grid positioning
  // with connections influencing position
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n, connections: 0 }]))
  
  // Count connections for each node
  edges.forEach(edge => {
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)
    if (source) source.connections++
    if (target) target.connections++
  })

  // Sort by connections (most connected nodes in center)
  const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => b.connections - a.connections)
  
  const cols = Math.ceil(Math.sqrt(nodes.length))
  const spacing = 250

  return sortedNodes.map((node, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    
    return {
      ...node,
      position: {
        x: col * spacing + 100,
        y: row * spacing + 100,
      },
    }
  })
}

// Circular layout
const getCircularLayout = (nodes: Node[]): Node[] => {
  const radius = Math.max(250, nodes.length * 30)
  
  return nodes.map((node, index) => {
    const angle = (index * 2 * Math.PI) / nodes.length
    
    return {
      ...node,
      position: {
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
    }
  })
}

const applyLayout = (nodes: Node[], edges: Edge[], layout: LayoutType): Node[] => {
  switch (layout) {
    case 'hierarchical':
      return getHierarchicalLayout(nodes, edges)
    case 'force':
      return getForceLayout(nodes, edges)
    case 'circular':
      return getCircularLayout(nodes)
    default:
      return nodes
  }
}

export const LineageGraph = ({ nodes: lineageNodes, edges: lineageEdges, onNodeClick }: LineageGraphProps) => {
  const [layout, setLayout] = useState<LayoutType>('hierarchical')

  // Handle node click
  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const lineageNode = lineageNodes.find(n => n.id === node.id)
    if (lineageNode && onNodeClick) {
      onNodeClick(lineageNode)
    }
  }, [lineageNodes, onNodeClick])

  // Transform lineage data into react-flow format
  const baseNodes: Node[] = useMemo(() => {
    const uniqueNodes = new Map<string, LineageNode>()
    lineageNodes.forEach(node => {
      if (!uniqueNodes.has(node.id)) {
        uniqueNodes.set(node.id, node)
      }
    })

    return Array.from(uniqueNodes.values()).map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        label: node.name,
        type: node.type,
        jurisdiction: node.jurisdiction,
        icon: getNodeIcon(node.type),
        color: getNodeColor(node.type),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }))
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

  // Apply layout whenever layout type or base nodes change
  const layoutedNodes = useMemo(() => {
    if (baseNodes.length === 0) return []
    return applyLayout(baseNodes, initialEdges, layout)
  }, [baseNodes, initialEdges, layout])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when layout changes
  const handleLayoutChange = useCallback((newLayout: LayoutType) => {
    setLayout(newLayout)
    const newNodes = applyLayout(baseNodes, initialEdges, newLayout)
    setNodes(newNodes)
  }, [baseNodes, initialEdges, setNodes])

  const onInit = useCallback(() => {
    // Initial layout is already applied
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
    <div className="h-[500px] border rounded-lg overflow-hidden bg-background relative">
      {/* Layout Controls */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-2 shadow-lg">
              <LayoutGrid className="h-4 w-4" />
              Layout: {layout === 'hierarchical' ? 'Hierarchical' : layout === 'force' ? 'Force-Directed' : 'Circular'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Graph Layout</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleLayoutChange('hierarchical')}>
              <Network className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">Hierarchical</div>
                <div className="text-xs text-muted-foreground">Left-to-right flow</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('force')}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">Force-Directed</div>
                <div className="text-xs text-muted-foreground">Grid-based organization</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLayoutChange('circular')}>
              <CircleIcon className="mr-2 h-4 w-4" />
              <div>
                <div className="font-medium">Circular</div>
                <div className="text-xs text-muted-foreground">Radial arrangement</div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
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