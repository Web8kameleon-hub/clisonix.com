/**
 * Optimized Memory Distribution System
 * Purpose: Distribute memory load across nodes without heavy dependencies
 * Features: Smart allocation, compression, distributed caching
 */

import { WebSocketHub } from './websocket';

// Memory node interface
interface MemoryNode {
  id: string;
  used: number;
  capacity: number;
  status: 'active' | 'overloaded' | 'maintenance';
  priority: number;
  location: 'main' | 'cache' | 'buffer' | 'edge';
  lastAccess: number;
}

// Signal tracking for memory usage
interface SignalStats {
  totalSent: number;
  totalBytes: number;
  compressionSaved: number;
  avgSize: number;
}

class DistributedMemoryManager {
  private nodes: Map<string, MemoryNode> = new Map();
  private signalStats: SignalStats = {
    totalSent: 0,
    totalBytes: 0,
    compressionSaved: 0,
    avgSize: 0
  };
  private distributionStrategy: 'round-robin' | 'least-used' | 'priority' = 'least-used';
  
  constructor() {
    this.initializeNodes();
    this.startMaintenanceLoop();
  }
  
  private initializeNodes() {
    // Main memory node - highest capacity
    this.addNode({
      id: 'main-memory',
      capacity: 512 * 1024 * 1024, // 512MB
      used: 0,
      status: 'active',
      priority: 10,
      location: 'main',
      lastAccess: Date.now()
    });
    
    // Cache node - fast access
    this.addNode({
      id: 'cache-node',
      capacity: 128 * 1024 * 1024, // 128MB
      used: 0,
      status: 'active',
      priority: 8,
      location: 'cache',
      lastAccess: Date.now()
    });
    
    // Buffer node - temporary storage
    this.addNode({
      id: 'buffer-node',
      capacity: 64 * 1024 * 1024, // 64MB
      used: 0,
      status: 'active',
      priority: 6,
      location: 'buffer',
      lastAccess: Date.now()
    });
    
    // Edge node - distributed processing
    this.addNode({
      id: 'edge-node',
      capacity: 32 * 1024 * 1024, // 32MB
      used: 0,
      status: 'active',
      priority: 4,
      location: 'edge',
      lastAccess: Date.now()
    });
  }
  
  addNode(node: MemoryNode): void {
    this.nodes.set(node.id, node);
    console.log(`[Memory] Node added: ${node.id} (${this.formatBytes(node.capacity)})`);
  }
  
  // Select optimal node for data storage
  selectOptimalNode(dataSize: number): MemoryNode | null {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => 
        node.status === 'active' && 
        (node.capacity - node.used) >= dataSize
      );
    
    if (availableNodes.length === 0) return null;
    
    switch (this.distributionStrategy) {
      case 'least-used':
        return availableNodes.sort((a, b) => (a.used / a.capacity) - (b.used / b.capacity))[0];
      case 'priority':
        return availableNodes.sort((a, b) => b.priority - a.priority)[0];
      case 'round-robin':
      default:
        return availableNodes[Math.floor(Math.random() * availableNodes.length)];
    }
  }
  
  // Allocate memory and track usage
  allocateMemory(dataSize: number, nodeId?: string): { success: boolean; nodeId?: string; usage?: number } {
    let targetNode: MemoryNode | null = null;
    
    if (nodeId) {
      targetNode = this.nodes.get(nodeId) || null;
    } else {
      targetNode = this.selectOptimalNode(dataSize);
    }
    
    if (!targetNode) {
      // Try garbage collection
      this.performGarbageCollection();
      targetNode = this.selectOptimalNode(dataSize);
    }
    
    if (!targetNode) {
      console.warn('[Memory] No available nodes for allocation');
      return { success: false };
    }
    
    targetNode.used += dataSize;
    targetNode.lastAccess = Date.now();
    
    const usage = (targetNode.used / targetNode.capacity) * 100;
    
    // Mark as overloaded if usage > 90%
    if (usage > 90) {
      targetNode.status = 'overloaded';
    }
    
    return { 
      success: true, 
      nodeId: targetNode.id, 
      usage: Math.round(usage) 
    };
  }
  
  // Simple garbage collection
  performGarbageCollection(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    this.nodes.forEach(node => {
      if (now - node.lastAccess > maxAge && node.used > 0) {
        // Simulate cleanup of old data
        const cleaned = Math.min(node.used, node.capacity * 0.1); // Clean 10% max
        node.used = Math.max(0, node.used - cleaned);
        
        if (node.status === 'overloaded' && (node.used / node.capacity) < 0.8) {
          node.status = 'active';
        }
        
        console.log(`[Memory] GC: Cleaned ${this.formatBytes(cleaned)} from ${node.id}`);
      }
    });
  }
  
  // Get system status
  getStatus() {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      location: node.location,
      capacity: this.formatBytes(node.capacity),
      used: this.formatBytes(node.used),
      usage: `${Math.round((node.used / node.capacity) * 100)}%`,
      status: node.status,
      priority: node.priority
    }));
    
    const totalCapacity = Array.from(this.nodes.values()).reduce((sum, node) => sum + node.capacity, 0);
    const totalUsed = Array.from(this.nodes.values()).reduce((sum, node) => sum + node.used, 0);
    
    return {
      nodes,
      totalCapacity: this.formatBytes(totalCapacity),
      totalUsed: this.formatBytes(totalUsed),
      utilization: `${Math.round((totalUsed / totalCapacity) * 100)}%`,
      distribution: this.distributionStrategy,
      signals: this.signalStats
    };
  }
  
  // Update signal statistics
  trackSignal(size: number, compressed: boolean, savedBytes: number = 0): void {
    this.signalStats.totalSent++;
    this.signalStats.totalBytes += size;
    if (compressed) {
      this.signalStats.compressionSaved += savedBytes;
    }
    this.signalStats.avgSize = this.signalStats.totalBytes / this.signalStats.totalSent;
  }
  
  // Format bytes to human readable
  private formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 10) / 10} ${sizes[i]}`;
  }
  
  // Maintenance loop
  private startMaintenanceLoop(): void {
    setInterval(() => {
      this.performGarbageCollection();
      
      // Rebalance if needed
      const overloadedNodes = Array.from(this.nodes.values())
        .filter(node => node.status === 'overloaded');
      
      if (overloadedNodes.length > 0) {
        console.log(`[Memory] ${overloadedNodes.length} nodes overloaded, rebalancing...`);
        this.rebalanceNodes();
      }
      
    }, 30000); // Every 30 seconds
  }
  
  // Rebalance memory across nodes
  private rebalanceNodes(): void {
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'active');
    
    const overloadedNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'overloaded');
    
    overloadedNodes.forEach(overloaded => {
      const availableNode = activeNodes.find(node => 
        (node.capacity - node.used) > (overloaded.capacity * 0.1)
      );
      
      if (availableNode) {
        // Simulate moving 10% of overloaded node's data
        const toMove = overloaded.capacity * 0.1;
        overloaded.used = Math.max(0, overloaded.used - toMove);
        availableNode.used += toMove;
        
        if ((overloaded.used / overloaded.capacity) < 0.8) {
          overloaded.status = 'active';
        }
        
        console.log(`[Memory] Rebalanced ${this.formatBytes(toMove)} from ${overloaded.id} to ${availableNode.id}`);
      }
    });
  }
  
  setDistributionStrategy(strategy: 'round-robin' | 'least-used' | 'priority'): void {
    this.distributionStrategy = strategy;
    console.log(`[Memory] Strategy changed to: ${strategy}`);
  }
}

// Singleton instance
const memoryManager = new DistributedMemoryManager();

/**
 * Enhanced signal broadcasting with memory optimization
 */
export const broadcastLayerSignal = (wss: WebSocketHub, layer: number, type: string, data: any) => {
  try {
    const startTime = Date.now();
    
    // Get memory status for optimization decisions
    const memoryStatus = memoryManager.getStatus();
    const utilization = parseInt(memoryStatus.utilization.replace('%', ''));
    
    // Optimize data based on memory pressure
    let optimizedData = data;
    let compressed = false;
    let savedBytes = 0;
    
    if (utilization > 70) {
      const originalSize = JSON.stringify(data).length;
      optimizedData = compressSignalData(data);
      const compressedSize = JSON.stringify(optimizedData).length;
      savedBytes = originalSize - compressedSize;
      compressed = true;
    }
    
    const packet = JSON.stringify({
      type: `layer${layer}:${type}`,
      ts: new Date().toISOString(),
      payload: optimizedData,
      meta: {
        layer,
        compressed,
        memoryUsage: memoryStatus.utilization,
        processTime: Date.now() - startTime
      }
    });
    
    // Allocate memory for this signal
    const allocation = memoryManager.allocateMemory(packet.length);
    
    // Send to WebSocket clients
    let sentCount = 0;
    for (const ws of wss.clients) {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(packet);
        sentCount++;
      }
    }
    
    // Track signal statistics
    memoryManager.trackSignal(packet.length, compressed, savedBytes);
    
    console.log(`[Layer ${layer}] Signal: ${type} | Size: ${packet.length}B | Clients: ${sentCount} | Memory: ${memoryStatus.utilization} ${allocation.success ? `(Node: ${allocation.nodeId})` : '(FAILED)'}`);
    
  } catch (error) {
    console.error(`[Layer ${layer}] Signal broadcast error:`, error);
  }
};

/**
 * Compress signal data intelligently
 */
const compressSignalData = (data: any): any => {
  if (typeof data === 'object' && data !== null) {
    const compressed: any = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      // Compress strings
      if (typeof value === 'string') {
        if (value.length > 100) {
          compressed[key] = value.substring(0, 97) + '...';
        } else {
          compressed[key] = value;
        }
      }
      // Round numbers to reduce precision
      else if (typeof value === 'number') {
        compressed[key] = Math.round(value * 1000) / 1000;
      }
      // Limit array sizes
      else if (Array.isArray(value)) {
        if (value.length > 10) {
          compressed[key] = [...value.slice(0, 8), `... +${value.length - 8} more`];
        } else {
          compressed[key] = value;
        }
      }
      // Recursively compress objects
      else if (typeof value === 'object') {
        compressed[key] = compressSignalData(value);
      }
      else {
        compressed[key] = value;
      }
    });
    
    return compressed;
  }
  
  return data;
};

/**
 * Get memory manager status
 */
export const getMemoryStatus = () => memoryManager.getStatus();

/**
 * Add new memory node
 */
export const addMemoryNode = (id: string, capacityMB: number, priority: number = 5) => {
  memoryManager.addNode({
    id,
    capacity: capacityMB * 1024 * 1024,
    used: 0,
    status: 'active',
    priority,
    location: 'edge',
    lastAccess: Date.now()
  });
};

/**
 * Set memory distribution strategy
 */
export const setMemoryStrategy = (strategy: 'round-robin' | 'least-used' | 'priority') => {
  memoryManager.setDistributionStrategy(strategy);
};

/**
 * Force garbage collection
 */
export const forceGarbageCollection = () => {
  memoryManager.performGarbageCollection();
  return memoryManager.getStatus();
};