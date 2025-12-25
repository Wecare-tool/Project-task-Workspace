import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    Panel,
    useReactFlow,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDataverse } from '@stores/dataverseStore';
import { TaskNode } from './TaskNode';
import type { TaskNodeData } from './TaskNode';
import { FlowEdge } from './FlowEdge';
import type { FlowEdgeData } from './FlowEdge';
import { DependencyOutcome } from '@services/dataverseTypes';
import { toast } from 'react-hot-toast';
import { GitBranch, Maximize2, GripVertical } from 'lucide-react';

interface Props {
    projectId: string;
}

const nodeTypes = { taskNode: TaskNode };
const edgeTypes = { flowEdge: FlowEdge };

// Auto-layout helper
function getGridPosition(index: number, columns: number = 3) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
        x: 50 + col * 250,
        y: 50 + row * 150,
    };
}

// localStorage helpers for persisting node positions
const STORAGE_KEY_PREFIX = 'taskflow-positions-';

function getStoredNodePositions(projectId: string): Record<string, { x: number; y: number }> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_PREFIX + projectId);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveNodePositions(projectId: string, nodes: Node[]) {
    try {
        const positions: Record<string, { x: number; y: number }> = {};
        nodes.forEach(node => {
            positions[node.id] = { x: node.position.x, y: node.position.y };
        });
        localStorage.setItem(STORAGE_KEY_PREFIX + projectId, JSON.stringify(positions));
    } catch {
        // Silently fail if localStorage is not available
    }
}

function TaskFlowCanvasInner({ projectId }: Props) {
    const {
        taskTypes,
        eventTypeTaskTypeMappings,
        createEventTypeTaskTypeMapping,
        updateEventTypeTaskTypeMapping,
        deactivateEventTypeTaskTypeMapping,
        refreshEventTypeTaskTypeMappings,
    } = useDataverse();

    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // Get project task types (mappings for this project)
    const projectMappings = useMemo(() =>
        eventTypeTaskTypeMappings.filter(m => m.projectId === projectId),
        [eventTypeTaskTypeMappings, projectId]
    );

    const projectTaskTypes = useMemo(() => {
        return taskTypes
            .filter(t => projectMappings.some(m => m.taskTypeId === t.id))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [taskTypes, projectMappings]);

    // Get flow connections (mappings with NextTask + outcome = flow edges)
    const flowMappings = useMemo(() =>
        projectMappings.filter(m =>
            !m.eventTypeId && // null event type = project flow
            m.nextTaskId && // has next task = is a flow connection
            m.outcome // has outcome = flow connection
        ),
        [projectMappings]
    );

    // Convert flow mappings to nodes
    const initialNodes = useMemo((): Node[] => {
        const involvedIds = new Set<string>();
        flowMappings.forEach(m => {
            involvedIds.add(m.taskTypeId);
            if (m.nextTaskId) involvedIds.add(m.nextTaskId);
        });

        // Load stored positions from localStorage
        const storedPositions = getStoredNodePositions(projectId);

        const nodes: Node[] = [];
        let index = 0;

        involvedIds.forEach(id => {
            const task = taskTypes.find(t => t.id === id);
            if (task) {
                // Use stored position if available, otherwise use grid layout
                const pos = storedPositions[id] || getGridPosition(index);
                nodes.push({
                    id: task.id,
                    type: 'taskNode',
                    position: pos,
                    data: { label: task.name, taskTypeId: task.id } as TaskNodeData,
                });
                index++;
            }
        });

        return nodes;
    }, [flowMappings, taskTypes, projectId]);

    // Convert flow mappings to edges
    const initialEdges = useMemo((): Edge[] => {
        return flowMappings.map(m => ({
            id: m.id,
            source: m.taskTypeId,
            target: m.nextTaskId!,
            sourceHandle: m.outcome === DependencyOutcome.Done ? 'success' : 'fail',
            type: 'flowEdge',
            data: {
                outcome: m.outcome === DependencyOutcome.Done ? 'success' : 'fail',
            } as FlowEdgeData,
        }));
    }, [flowMappings]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [showMiniMap, setShowMiniMap] = useState(true);
    const { screenToFlowPosition } = useReactFlow();

    // Sync edges with flowMappings when data changes
    useEffect(() => {
        const newEdges = flowMappings.map(m => ({
            id: m.id,
            source: m.taskTypeId,
            target: m.nextTaskId!,
            sourceHandle: m.outcome === DependencyOutcome.Done ? 'success' : 'fail',
            type: 'flowEdge',
            data: {
                outcome: m.outcome === DependencyOutcome.Done ? 'success' : 'fail',
            } as FlowEdgeData,
        }));
        setEdges(newEdges);
    }, [flowMappings, setEdges]);

    // Save node positions to localStorage when nodes change (debounced)
    useEffect(() => {
        if (nodes.length === 0) return;

        const timeoutId = setTimeout(() => {
            saveNodePositions(projectId, nodes);
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
    }, [nodes, projectId]);

    // Handle edge deletion - DELETE the mapping row
    const handleDeleteEdge = useCallback(async (edgeId: string): Promise<void> => {
        if (!confirm('Remove this connection?')) return;

        try {
            // Find the mapping by ID
            const mapping = eventTypeTaskTypeMappings.find(m => m.id === edgeId);
            if (!mapping) {
                toast.error('Mapping not found');
                return;
            }

            // DEACTIVATE (delete) the mapping row
            await deactivateEventTypeTaskTypeMapping(mapping.id);
            await refreshEventTypeTaskTypeMappings();
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove connection');
        }
    }, [eventTypeTaskTypeMappings, deactivateEventTypeTaskTypeMapping, refreshEventTypeTaskTypeMappings]);

    // Inject onDelete handler into edge data
    const edgesWithHandlers = useMemo(() =>
        edges.map(e => ({
            ...e,
            data: {
                ...(e.data as FlowEdgeData),
                onDelete: handleDeleteEdge,
            },
        })),
        [edges, handleDeleteEdge]
    );

    // Handle remove task from project
    const handleRemoveTask = useCallback(async (taskTypeId: string) => {
        if (!confirm('Remove this task from the project?')) return;

        try {
            // Find and deactivate ALL mappings for this task (base mapping + flow connections)
            const taskMappings = projectMappings.filter(m =>
                m.taskTypeId === taskTypeId || m.nextTaskId === taskTypeId
            );

            for (const mapping of taskMappings) {
                await deactivateEventTypeTaskTypeMapping(mapping.id);
            }

            await refreshEventTypeTaskTypeMappings();
            // Remove node from canvas
            setNodes(nds => nds.filter(n => n.id !== taskTypeId));
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove task');
        }
    }, [projectMappings, deactivateEventTypeTaskTypeMapping, refreshEventTypeTaskTypeMappings, setNodes]);

    // Inject action handlers into node data
    const nodesWithHandlers = useMemo(() =>
        nodes.map(n => ({
            ...n,
            data: {
                ...(n.data as TaskNodeData),
                onRemove: handleRemoveTask,
            },
        })),
        [nodes, handleRemoveTask]
    );

    // Handle new connection
    const onConnect = useCallback(async (connection: Connection) => {
        if (!connection.source || !connection.target || !connection.sourceHandle) return;

        const outcome = connection.sourceHandle === 'success'
            ? DependencyOutcome.Done
            : DependencyOutcome.Fail;

        // Check if this exact connection already exists
        const existsExact = flowMappings.some(m =>
            m.taskTypeId === connection.source &&
            m.nextTaskId === connection.target &&
            m.outcome === outcome
        );

        if (existsExact) {
            toast.error('This connection already exists');
            return;
        }

        try {
            // Check if there's an existing mapping for source task without NextTask (base mapping)
            const baseMapping = projectMappings.find(m =>
                m.taskTypeId === connection.source &&
                !m.nextTaskId && // no next task yet
                !m.outcome // no outcome yet
            );

            if (baseMapping) {
                // UPDATE existing mapping to add NextTask + Outcome
                await updateEventTypeTaskTypeMapping(baseMapping.id, {
                    'crdfd_Nexttask@odata.bind': `/crdfd_task_types(${connection.target})`,
                    crdfd_outcome: outcome,
                } as unknown as Record<string, unknown>);
            } else {
                // CREATE new mapping for the flow connection
                await createEventTypeTaskTypeMapping({
                    crdfd_name: `Flow: ${connection.source}->${connection.target}`,
                    'crdfd_Project@odata.bind': `/crdfd_projects(${projectId})`,
                    'crdfd_Task@odata.bind': `/crdfd_task_types(${connection.source})`,
                    'crdfd_Nexttask@odata.bind': `/crdfd_task_types(${connection.target})`,
                    crdfd_outcome: outcome,
                });
            }

            await refreshEventTypeTaskTypeMappings();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create connection');
        }
    }, [flowMappings, projectMappings, projectId, createEventTypeTaskTypeMapping, updateEventTypeTaskTypeMapping, refreshEventTypeTaskTypeMappings]);

    // Drag and drop from sidebar
    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: DragEvent) => {
        event.preventDefault();

        const taskTypeId = event.dataTransfer.getData('application/tasktype');
        if (!taskTypeId) return;

        const task = taskTypes.find(t => t.id === taskTypeId);
        if (!task) return;

        // Check if already on canvas
        if (nodes.some(n => n.id === taskTypeId)) {
            toast.error('Task already on canvas');
            return;
        }

        // Get drop position relative to the canvas, using screenToFlowPosition
        // to properly convert screen coordinates to flow coordinates (accounting for zoom/pan)
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        // Offset so the node appears centered under the cursor
        position.x -= 80;
        position.y -= 30;

        const newNode: Node = {
            id: task.id,
            type: 'taskNode',
            position,
            data: { label: task.name, taskTypeId: task.id } as TaskNodeData,
        };

        setNodes((nds: Node[]) => [...nds, newNode]);
    }, [taskTypes, nodes, setNodes, screenToFlowPosition]);

    const onDragStart = (event: DragEvent, taskTypeId: string) => {
        event.dataTransfer.setData('application/tasktype', taskTypeId);
        event.dataTransfer.effectAllowed = 'move';
    };

    // Tasks not yet on canvas
    const availableTasks = projectTaskTypes.filter(t => !nodes.some(n => n.id === t.id));

    return (
        <div className="h-full flex">
            {/* Sidebar */}
            <div className="w-[400px] shrink-0 border-r bg-neutral-50 flex flex-col">
                <div className="p-3 border-b">
                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Task Types
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Drag tasks to canvas</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {availableTasks.map(task => (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(e: DragEvent<HTMLDivElement>) => onDragStart(e, task.id)}
                            className="p-3 bg-white border border-neutral-200 rounded-lg shadow-sm cursor-grab hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-3 group active:cursor-grabbing"
                        >
                            <GripVertical className="w-4 h-4 text-neutral-300 group-hover:text-primary-400" />
                            <span className="text-sm font-medium text-neutral-700">{task.name}</span>
                        </div>
                    ))}
                    {availableTasks.length === 0 && (
                        <div className="text-center text-sm text-neutral-400 py-8">
                            All tasks on canvas
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="p-3 border-t bg-white">
                    <p className="text-xs font-medium text-neutral-600 mb-2">Connection Types</p>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-8 h-0.5 bg-green-500" />
                            <span className="text-green-700">Success path</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-8 h-0.5 border-t-2 border-dashed border-red-500" />
                            <span className="text-red-700">Fail path</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodesWithHandlers}
                    edges={edgesWithHandlers}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    defaultViewport={{ x: 100, y: 50, zoom: 1 }}
                    minZoom={0.3}
                    maxZoom={2}
                    snapToGrid
                    snapGrid={[15, 15]}
                    defaultEdgeOptions={{
                        type: 'flowEdge',
                    }}
                    connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
                    <Controls
                        showZoom
                        showFitView
                        showInteractive={false}
                        className="!bg-white !border !border-neutral-200 !shadow-sm"
                    />
                    {showMiniMap && (
                        <MiniMap
                            nodeColor="#6366f1"
                            maskColor="rgba(255, 255, 255, 0.8)"
                            className="!bg-white !border !border-neutral-200"
                        />
                    )}

                    {/* Top Panel */}
                    <Panel position="top-right" className="flex gap-2">
                        <button
                            onClick={() => setShowMiniMap(!showMiniMap)}
                            className={`
                                p-2 rounded-md border transition-all
                                ${showMiniMap
                                    ? 'bg-primary-50 border-primary-200 text-primary-600'
                                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'}
                            `}
                            title="Toggle minimap"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </Panel>

                    {/* Empty state */}
                    {nodes.length === 0 && (
                        <Panel position="top-center" className="mt-20">
                            <div className="text-center p-8 bg-white/80 backdrop-blur rounded-xl border border-dashed border-neutral-300">
                                <GitBranch className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                                <p className="font-medium text-neutral-600">No tasks on canvas</p>
                                <p className="text-sm text-neutral-400 mt-1">
                                    Drag task types from the sidebar to start building your flow
                                </p>
                            </div>
                        </Panel>
                    )}
                </ReactFlow>
            </div>
        </div>
    );
}

// Wrapper to provide ReactFlow context
export function TaskFlowCanvas({ projectId }: Props) {
    return (
        <ReactFlowProvider>
            <TaskFlowCanvasInner projectId={projectId} />
        </ReactFlowProvider>
    );
}
