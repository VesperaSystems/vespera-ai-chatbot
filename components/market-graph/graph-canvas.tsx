"use client";

import { Billboard, Line, OrbitControls, Stars, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import type { Group, PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Vector3 } from "three";

import { PositionedVentureNode, VentureEdge } from "@/types/venture";

interface GraphCanvasProps {
  nodes: PositionedVentureNode[];
  edges: VentureEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  compact?: boolean;
  fullscreen?: boolean;
}

function toCountryCode(value: string | null) {
  if (!value) return "XX";
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function valuationCode(value: number | null) {
  if (!value) return "NA";
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1).replace(/\.0$/, "")}B`;
  return `${Math.round(value / 1000000)}M`;
}

function typeCode(value: PositionedVentureNode["type"]) {
  return {
    company: "CO",
    investor: "IV",
    founder: "FD",
    university: "UN",
    sector: "SC",
  }[value];
}

function shortName(value: string) {
  return value
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 4).toUpperCase())
    .join("-")
    .slice(0, 16);
}

function nodeLabel(node: PositionedVentureNode) {
  const primary = `${typeCode(node.type)}-${String(node.foundedYear ?? 0).slice(-2) || "00"} ${shortName(node.name)}`;
  const secondary = `${toCountryCode(node.country)} ${node.stage ?? node.sector ?? "NETWORK"}`;
  const tertiary = `${valuationCode(node.valuationGBP)} | INF ${node.metrics.influenceScore}`;

  return `${primary}\n${secondary}\n${tertiary}`;
}

function nodeWeight(node: PositionedVentureNode) {
  return (node.valuationGBP ?? 0) / 1000000 + node.metrics.influenceScore * 3 + node.metrics.connectionCount * 16;
}

function buildFocusCamera(source: PositionedVentureNode, target: PositionedVentureNode) {
  const sourceVec = new Vector3(...source.position);
  const targetVec = new Vector3(...target.position);
  const midpoint = sourceVec.clone().add(targetVec).multiplyScalar(0.5);
  const axis = targetVec.clone().sub(sourceVec).normalize();
  const normal = new Vector3(-axis.z, 0.22, axis.x).normalize();
  const distance = Math.max(sourceVec.distanceTo(targetVec) * 1.55, 12);
  const cameraPosition = midpoint.clone().add(normal.multiplyScalar(distance)).add(new Vector3(0, 3.2, 0));

  return {
    target: midpoint,
    position: cameraPosition,
  };
}

function CameraDirector({
  controlsRef,
  focus,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
  focus: { position: Vector3; target: Vector3 } | null;
}) {
  useFrame(({ camera }) => {
    if (!focus) return;

    const activeCamera = camera as PerspectiveCamera;
    activeCamera.position.lerp(focus.position, 0.06);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(focus.target, 0.08);
      controlsRef.current.update();
    }
  });

  return null;
}

function DriftingNode({
  node,
  isSelected,
  isHovered,
  showLabel,
  onSelectNode,
  onHover,
  compact = false,
}: {
  node: PositionedVentureNode;
  isSelected: boolean;
  isHovered: boolean;
  showLabel: boolean;
  onSelectNode: (nodeId: string | null) => void;
  onHover: (nodeId: string | null) => void;
  compact?: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const offset = node.position[0] * 0.37 + node.position[1] * 0.22;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * 0.22 + offset;
    groupRef.current.position.set(
      node.position[0] + Math.sin(t) * 0.18,
      node.position[1] + Math.cos(t * 1.2) * 0.14,
      node.position[2] + Math.sin(t * 0.85) * 0.12,
    );
  });

  const scale = isSelected ? 1.22 : isHovered ? 1.08 : 1;
  const sphereSize = node.radius * (compact ? 0.68 : 0.82);

  return (
    <group ref={groupRef} position={node.position}>
      <mesh
        scale={scale}
        onClick={(event) => {
          event.stopPropagation();
          onSelectNode(node.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(node.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[sphereSize, 20, 20]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isSelected ? 0.38 : isHovered ? 0.24 : 0.08}
          transparent
          opacity={isSelected ? 0.32 : isHovered ? 0.24 : 0.14}
          roughness={0.16}
          metalness={0.82}
        />
      </mesh>
      {showLabel ? (
        <Billboard
          position={[0, sphereSize + (compact ? 0.54 : 0.78), 0]}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            color={isSelected ? "#ffffff" : isHovered ? "#e4e4e7" : "#a1a1aa"}
            fontSize={compact ? 0.22 : 0.28}
            lineHeight={1.28}
            anchorX="center"
            anchorY="middle"
            maxWidth={7.5}
          >
            {nodeLabel(node)}
          </Text>
        </Billboard>
      ) : null}
    </group>
  );
}

function GraphScene({ nodes, edges, selectedNodeId, onSelectNode, compact }: GraphCanvasProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [focusedEdgeId, setFocusedEdgeId] = useState<string | null>(null);
  const [manualView, setManualView] = useState(false);
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const importantNodeIds = useMemo(() => {
    return new Set(
      nodes
        .slice()
        .sort((a, b) => nodeWeight(b) - nodeWeight(a))
        .slice(0, compact ? 14 : 24)
        .map((node) => node.id),
    );
  }, [compact, nodes]);

  const selectedEdgeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return new Set(
      edges
        .filter((edge) => edge.source === selectedNodeId || edge.target === selectedNodeId)
        .map((edge) => edge.id),
    );
  }, [edges, selectedNodeId]);

  const focusNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedNodeId) ids.add(selectedNodeId);
    if (hoveredNodeId) ids.add(hoveredNodeId);

    const activeEdge = edges.find((edge) => edge.id === focusedEdgeId || edge.id === hoveredEdgeId);
    if (activeEdge) {
      ids.add(activeEdge.source);
      ids.add(activeEdge.target);
    }

    return ids;
  }, [edges, focusedEdgeId, hoveredEdgeId, hoveredNodeId, selectedNodeId]);

  const cameraFocus = useMemo(() => {
    const activeEdge = edges.find((edge) => edge.id === focusedEdgeId);
    if (!activeEdge) return null;

    const source = nodeMap.get(activeEdge.source);
    const target = nodeMap.get(activeEdge.target);
    if (!source || !target) return null;

    return buildFocusCamera(source, target);
  }, [edges, focusedEdgeId, nodeMap]);

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 20, 55]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[18, 20, 12]} intensity={42} color="#f5f5f5" />
      <pointLight position={[-18, -12, -10]} intensity={28} color="#a3a3a3" />
      <Stars radius={65} depth={34} count={1400} factor={3.2} fade speed={0.42} saturation={0} />
      <CameraDirector controlsRef={controlsRef} focus={cameraFocus} />

      {edges.map((edge, index) => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return null;

        const active =
          selectedEdgeIds.has(edge.id) ||
          edge.id === focusedEdgeId ||
          edge.id === hoveredEdgeId ||
          (selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId));

        return (
          <Line
            key={edge.id}
            points={[source.position, target.position]}
            color={active ? "#fafafa" : index % 4 === 0 ? "#a3a3a3" : "#404040"}
            transparent
            opacity={active ? 0.88 : index % 4 === 0 ? 0.3 : 0.18}
            lineWidth={active ? 1.8 : Math.max(0.38, edge.strength * 0.78)}
            dashed={!active && index % 3 === 0}
            dashScale={12}
            gapSize={0.55}
            dashSize={0.95}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHoveredEdgeId(edge.id);
            }}
            onPointerOut={() => setHoveredEdgeId(null)}
            onClick={(event) => {
              event.stopPropagation();
              setManualView(false);
              setFocusedEdgeId((current) => (current === edge.id ? null : edge.id));
              onSelectNode(null);
            }}
          />
        );
      })}

      {nodes.map((node) => (
        <DriftingNode
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          isHovered={hoveredNodeId === node.id}
          showLabel={
            selectedNodeId === node.id ||
            hoveredNodeId === node.id ||
            focusNodeIds.has(node.id) ||
            importantNodeIds.has(node.id)
          }
          onSelectNode={(nodeId) => {
            setFocusedEdgeId(null);
            setManualView(true);
            onSelectNode(nodeId);
          }}
          onHover={setHoveredNodeId}
          compact={compact}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        maxDistance={50}
        minDistance={10}
        autoRotate={!cameraFocus && !manualView}
        autoRotateSpeed={0.22}
        onStart={() => setManualView(true)}
      />
    </>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  const { compact = false, fullscreen = false } = props;

  return (
    <div
      className={
        fullscreen
          ? "relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-[#050505]"
          : "relative h-full min-h-[620px] overflow-hidden border border-white/15 bg-gradient-to-b from-[rgba(18,18,18,0.88)] to-[rgba(4,4,4,0.76)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-[18px]"
      }
    >
      <Canvas
        camera={{ position: [0, 10, 28], fov: 48 }}
        onPointerMissed={() => props.onSelectNode(null)}
      >
        <GraphScene {...props} compact={compact} />
      </Canvas>
    </div>
  );
}
