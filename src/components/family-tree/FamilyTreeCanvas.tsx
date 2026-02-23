// ============================================
// FAMILY TREE CANVAS COMPONENT
// ============================================

import { useRef, useEffect, useState, useCallback } from 'react';
import type { FamilyMember, FamilyTreeData } from '@/types';
import { FamilyNode, FamilyNodeCompact } from './FamilyNode';
import { Button } from '@/components/ui/button';
import { 
  Minus,
  Plus,
  Maximize2, 
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyTreeCanvasProps {
  treeData: FamilyTreeData;
  selectedMemberId?: string | null;
  onSelectMember: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onDeleteMember?: (member: FamilyMember) => void;
  onAddChild?: (parentId: string) => void;
  onAddSpouse?: (memberId: string) => void;
  className?: string;
}

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

const NODE_WIDTH = 224;
const NODE_HEIGHT = 160;
const LEVEL_HEIGHT = 200;
const SIBLING_SPACING = 280;

export function FamilyTreeCanvas({
  treeData,
  selectedMemberId,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onAddChild,
  onAddSpouse,
  className,
}: FamilyTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 50,
    scale: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [compactMode, setCompactMode] = useState(false);

  // Calculate node positions
  const calculatePositions = useCallback((data: FamilyTreeData): Record<string, { x: number; y: number }> => {
    const positions: Record<string, { x: number; y: number }> = {};
    const processed = new Set<string>();
    
    // Group nodes by level
    const levelGroups: Record<number, string[]> = {};
    Object.entries(data.nodes).forEach(([id, node]) => {
      if (!levelGroups[node.level]) {
        levelGroups[node.level] = [];
      }
      levelGroups[node.level].push(id);
    });

    // Position nodes level by level
    const levels = Object.keys(levelGroups).map(Number).sort((a, b) => a - b);
    
    levels.forEach((level) => {
      const nodesAtLevel = levelGroups[level];
      const totalWidth = nodesAtLevel.length * SIBLING_SPACING;
      const startX = -totalWidth / 2 + SIBLING_SPACING / 2;

      nodesAtLevel.forEach((nodeId, index) => {
        const node = data.nodes[nodeId];
        
        // If node has a spouse, position them together
        if (node.spouses.length > 0 && !processed.has(nodeId)) {
          const spouseId = node.spouses[0];
          const spouse = data.nodes[spouseId];
          
          if (spouse) {
            const pairX = startX + index * SIBLING_SPACING;
            positions[nodeId] = { x: pairX - 60, y: level * LEVEL_HEIGHT };
            positions[spouseId] = { x: pairX + 60, y: level * LEVEL_HEIGHT };
            processed.add(nodeId);
            processed.add(spouseId);
            return;
          }
        }

        if (!processed.has(nodeId)) {
          positions[nodeId] = {
            x: startX + index * SIBLING_SPACING,
            y: level * LEVEL_HEIGHT,
          };
          processed.add(nodeId);
        }
      });
    });

    return positions;
  }, []);

  const positions = calculatePositions(treeData);

  // Zoom controls
  const handleZoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 3),
    }));
  };

  const handleZoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.3),
    }));
  };

  const handleReset = () => {
    setViewport({
      x: 0,
      y: 50,
      scale: 1,
    });
  };

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - viewport.x, y: touch.clientY - viewport.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setViewport((prev) => ({
        ...prev,
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Render connection lines
  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    
    Object.entries(treeData.nodes).forEach(([id, node]) => {
      const pos = positions[id];
      if (!pos) return;

      // Parent-child connections
      node.children.forEach((childId) => {
        const childPos = positions[childId];
        if (!childPos) return;

        const startX = pos.x + NODE_WIDTH / 2;
        const startY = pos.y + NODE_HEIGHT;
        const endX = childPos.x + NODE_WIDTH / 2;
        const endY = childPos.y;

        // Draw elbow connector
        const midY = startY + (endY - startY) / 2;

        connections.push(
          <path
            key={`${id}-${childId}`}
            d={`M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      });

      // Spouse connections
      node.spouses.forEach((spouseId) => {
        // Only draw once (from lower ID to higher ID)
        if (id < spouseId) {
          const spousePos = positions[spouseId];
          if (!spousePos) return;

          const startX = pos.x + NODE_WIDTH;
          const startY = pos.y + NODE_HEIGHT / 2;
          const endX = spousePos.x;
          const endY = spousePos.y + NODE_HEIGHT / 2;

          connections.push(
            <g key={`spouse-${id}-${spouseId}`}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#f472b6"
                strokeWidth="2"
              />
              {/* Heart icon in the middle */}
              <text
                x={(startX + endX) / 2}
                y={startY - 5}
                textAnchor="middle"
                fill="#f472b6"
                fontSize="14"
              >
                ♥
              </text>
            </g>
          );
        }
      });
    });

    return connections;
  };

  // Center the tree initially
  useEffect(() => {
    if (containerRef.current && treeData.rootIds.length > 0) {
      const containerWidth = containerRef.current.clientWidth;
      setViewport((prev) => ({
        ...prev,
        x: containerWidth / 2,
      }));
    }
  }, [treeData.rootIds.length]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100',
        isDragging && 'cursor-grabbing',
        !isDragging && 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg p-1.5 flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="h-8 w-8"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="h-8 w-8"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-1.5">
          <Button
            variant={compactMode ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setCompactMode(!compactMode)}
            className="h-8 w-8"
          >
            <Users className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-600">
        {Math.round(viewport.scale * 100)}%
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* SVG Connections Layer */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            width: '5000px',
            height: '5000px',
            left: '-2500px',
            top: '-2500px',
          }}
        >
          <g transform="translate(2500, 2500)">
            {renderConnections()}
          </g>
        </svg>

        {/* Nodes Layer */}
        <div className="relative">
          {Object.entries(treeData.nodes).map(([id, node]) => {
            const pos = positions[id];
            if (!pos) return null;

            return (
              <div
                key={id}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(0, 0)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMember(node);
                }}
              >
                {compactMode ? (
                  <FamilyNodeCompact
                    member={node}
                    isSelected={selectedMemberId === id}
                    onClick={() => onSelectMember(node)}
                  />
                ) : (
                  <FamilyNode
                    member={node}
                    isSelected={selectedMemberId === id}
                    onClick={() => onSelectMember(node)}
                    onEdit={onEditMember ? () => onEditMember(node) : undefined}
                    onDelete={onDeleteMember ? () => onDeleteMember(node) : undefined}
                    onAddChild={onAddChild ? () => onAddChild(id) : undefined}
                    onAddSpouse={onAddSpouse ? () => onAddSpouse(id) : undefined}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {Object.keys(treeData.nodes).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Belum ada data keluarga</p>
            <p className="text-gray-400 text-sm">Tambahkan anggota keluarga pertama</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FamilyTreeCanvas;
