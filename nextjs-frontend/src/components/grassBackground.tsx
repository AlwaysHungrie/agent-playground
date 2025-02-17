"use client";
import Image from "next/image";
import { useState, useEffect, useCallback, memo, useRef } from "react";

interface GrassElement {
  id: number;
  x: number;
  y: number;
  isGrass1: boolean;
  scale: number;
  clusterId: number;
}

interface Cluster {
  centerX: number;
  centerY: number;
  size: number;
  density: number;
}

const CLUSTER_COUNT = 8; // Reduced from 12
const MIN_GRASS_PER_CLUSTER = 3; // Reduced from 4
const MAX_GRASS_PER_CLUSTER = 6; // Reduced from 8
const BASE_CLUSTER_RADIUS = 8;
const FALL_SPEED = 0.1;
const MIN_DISTANCE = 15;
const PHI = (Math.sqrt(5) + 1) / 2;
const VIEWPORT_BUFFER = 20;
const MAX_TOTAL_ELEMENTS = 45; // New constant to limit total elements

const GrassSprite = memo(({ grass }: { grass: GrassElement }) => (
  <Image
    src={grass.isGrass1 ? "/grass1.svg" : "/grass2.svg"}
    alt={grass.isGrass1 ? "grass1" : "grass2"}
    width={15}
    height={10}
    className="absolute"
    style={{
      left: `${grass.x}%`,
      top: `${grass.y}%`,
      transform: `scale(${grass.scale})`,
      transformOrigin: 'bottom center',
    }}
  />
));

GrassSprite.displayName = 'GrassSprite';

export default function GrassBackground() {
  const [visibleGrassElements, setVisibleGrassElements] = useState<GrassElement[]>([]);
  const idCounterRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);

  const getNextId = useCallback(() => {
    idCounterRef.current += 1;
    return idCounterRef.current;
  }, []);

  const generateClusters = useCallback(() => {
    const clusters: Cluster[] = [];

    const attemptPlaceCluster = (attempts: number = 0): boolean => {
      if (attempts > 50) return false;

      const centerX = Math.random() * 100;
      const centerY = Math.random() * 100;

      const tooClose = clusters.some(cluster => {
        const dx = centerX - cluster.centerX;
        const dy = centerY - cluster.centerY;
        return Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE;
      });

      if (!tooClose) {
        clusters.push({
          centerX,
          centerY,
          size: BASE_CLUSTER_RADIUS * (0.7 + Math.random() * 0.6),
          density: 0.5 + Math.random() * 0.5
        });
        return true;
      }

      return attemptPlaceCluster(attempts + 1);
    };

    while (clusters.length < CLUSTER_COUNT) {
      attemptPlaceCluster();
    }

    return clusters;
  }, []);

  const generateGrassElements = useCallback((clusters: Cluster[], startY: number = 0) => {
    const elements: GrassElement[] = [];

    clusters.forEach((cluster, clusterId) => {
      const grassCount = Math.floor(
        MIN_GRASS_PER_CLUSTER +
        Math.random() * (MAX_GRASS_PER_CLUSTER - MIN_GRASS_PER_CLUSTER)
      );
      
      for (let i = 0; i < grassCount; i++) {
        const theta = 2 * Math.PI * PHI * i;
        const radius = cluster.size * Math.pow(Math.random(), 0.5) * cluster.density;
        
        const x = cluster.centerX + radius * Math.cos(theta);
        const y = startY + cluster.centerY + radius * Math.sin(theta);

        if (x >= -5 && x <= 105) {
          elements.push({
            id: getNextId(),
            x,
            y,
            isGrass1: Math.random() > 0.3,
            scale: 0.8 + Math.random() * 0.4,
            clusterId
          });
        }
      }
    });

    return elements;
  }, [getNextId]);

  useEffect(() => {
    let animationFrameId: number;
    const initialClusters = generateClusters();
    setVisibleGrassElements(generateGrassElements(initialClusters, -VIEWPORT_BUFFER));

    const updateGrassElements = (timestamp: number) => {
      // Throttle updates to every 16ms (approximately 60fps)
      if (timestamp - lastUpdateTimeRef.current < 16) {
        animationFrameId = requestAnimationFrame(updateGrassElements);
        return;
      }
      lastUpdateTimeRef.current = timestamp;

      setVisibleGrassElements(prevElements => {
        // Move existing elements down
        const movedElements = prevElements.map(element => ({
          ...element,
          y: element.y + FALL_SPEED
        }));

        // Remove elements that are below viewport
        const remainingElements = movedElements.filter(element => element.y <= 100 + VIEWPORT_BUFFER);

        // Only generate new elements if we're below the maximum
        if (remainingElements.length < prevElements.length && remainingElements.length < MAX_TOTAL_ELEMENTS) {
          const newClusters = generateClusters();
          const newElements = generateGrassElements(newClusters, -VIEWPORT_BUFFER);
          
          // Limit the total number of elements
          const combinedElements = [...remainingElements, ...newElements];
          const limitedElements = combinedElements.slice(0, MAX_TOTAL_ELEMENTS);
          
          // Sort by Y position
          return limitedElements.sort((a, b) => a.y - b.y);
        }

        return remainingElements;
      });

      animationFrameId = requestAnimationFrame(updateGrassElements);
    };

    animationFrameId = requestAnimationFrame(updateGrassElements);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [generateClusters, generateGrassElements]);

  return (
    <div className="bg-green-500 h-screen w-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[#89D195]" />
      {visibleGrassElements.map(grass => (
        <GrassSprite key={grass.id} grass={grass} />
      ))}
    </div>
  );
}