import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '../components/graph/CustomNode';
import Card from '../components/ui/Card';

const initialNodes = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'START', type: 'START', isActive: false } },
  { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Intent Router', type: 'Router', latency: 45, status: 'success', isActive: false } },
  { id: '3', type: 'custom', position: { x: 100, y: 280 }, data: { label: 'Knowledge Retrieval', type: 'Knowledge', latency: 120, status: 'success', isActive: false } },
  { id: '4', type: 'custom', position: { x: 400, y: 280 }, data: { label: 'Tool Execution', type: 'Action', latency: 310, status: 'success', isActive: false } },
  { id: '5', type: 'custom', position: { x: 250, y: 400 }, data: { label: 'Response Generator', type: 'Generator', latency: 850, status: 'success', isActive: true } },
  { id: '6', type: 'custom', position: { x: 250, y: 520 }, data: { label: 'END', type: 'END', isActive: false } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: false, style: { stroke: '#334155' } },
  { id: 'e2-3', source: '2', target: '3', animated: false, style: { stroke: '#334155' }, label: 'policy' },
  { id: 'e2-4', source: '2', target: '4', animated: false, style: { stroke: '#334155' }, label: 'action' },
  { id: 'e3-5', source: '3', target: '5', animated: false, style: { stroke: '#334155' } },
  { id: 'e4-5', source: '4', target: '5', animated: false, style: { stroke: '#334155' } },
  { id: 'e5-6', source: '5', target: '6', animated: true, style: { stroke: '#3b82f6' } },
];

export default function ExecutionGraph() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex h-full p-6 md:p-8 max-w-[1600px] mx-auto gap-6">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Execution Graph</h1>
          <p className="text-muted mt-1">Visualize LangGraph execution trace and state transitions.</p>
        </div>
        
        <div className="flex-1 rounded-xl border border-border overflow-hidden bg-background">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#0B1220]"
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls className="bg-card border-border fill-foreground" />
            <Panel position="top-right" className="bg-card/80 p-2 rounded border border-border text-xs text-muted backdrop-blur-sm">
              Run ID: req_98a7b6c5
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Side Panel for Node Details */}
      <div className="w-80 shrink-0 hidden lg:flex flex-col">
        {selectedNode ? (
          <Card className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground text-lg">{selectedNode.data.label}</h3>
              <p className="text-sm text-muted">Type: {selectedNode.data.type}</p>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Metrics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-background p-2 rounded border border-border">
                      <div className="text-xs text-muted">Latency</div>
                      <div className="font-mono">{selectedNode.data.latency || 0}ms</div>
                    </div>
                    <div className="bg-background p-2 rounded border border-border">
                      <div className="text-xs text-muted">Status</div>
                      <div className={`font-medium ${selectedNode.data.status === 'error' ? 'text-danger' : 'text-success'}`}>
                        {selectedNode.data.status || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">State Output</h4>
                  <pre className="text-xs bg-background p-3 rounded border border-border overflow-x-auto text-primary/90 font-mono">
{JSON.stringify({
  input: "user_query",
  confidence: 0.98,
  output: {
    result: "success",
    tokens: 45
  }
}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-muted p-6 text-center border border-dashed border-border rounded-xl">
            <p>Click on a node to view detailed execution state and metrics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
