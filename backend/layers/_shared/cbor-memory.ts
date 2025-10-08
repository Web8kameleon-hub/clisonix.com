/**
 * CBOR Memory Distribution System
 * Purpose: Efficient binary serialization and distributed memory management
 * Features: CBOR encoding/decoding, memory sharding, node distribution
 */

import cbor from 'cbor';
import { EventEmitter } from 'events';

export interface MemoryNode {
  id: string;
  capacity: number; // bytes
  used: number;
  status: 'active' | 'overloaded' | 'maintenance' | 'offline';
  priority: number; // 1-10
  lastHeartbeat: Date;
  location?: 'local' | 'remote' | 'edge';
}

export interface MemoryChunk {
  id: string;
  nodeId: string;
  size: number;
  checksum: string;
  created: Date;
  accessed: Date;
  ttl?: number; // time to live in seconds
  compressed: boolean;
  encrypted: boolean;
}

export interface CBORData {
  type: 'signal' | 'metrics' | 'config' | 'media' | 'log';
  timestamp: number;
  payload: any;
  metadata?: {
    source: string;
    priority: number;
    compression?: boolean;
  };
}

export class CBORMemoryManager extends EventEmitter {
  private nodes: Map<string, MemoryNode> = new Map();
  private chunks: Map<string, MemoryChunk> = new Map();
  private distributionStrategy: 'round-robin' | 'least-used' | 'priority' = 'least-used';
  private compressionThreshold = 1024; // bytes
  private maxChunkSize = 64 * 1024; // 64KB
  
  constructor() {
    super();
    this.initializeDefaultNodes();
    this.startHeartbeatMonitoring();
  }

  private initializeDefaultNodes() {
    // Main memory node
    this.addNode({
      id: 'main-memory',
      capacity: 256 * 1024 * 1024, // 256MB
      used: 0,
      status: 'active',
      priority: 10,
      lastHeartbeat: new Date(),
      location: 'local'
    });

    // Cache node
    this.addNode({
      id: 'cache-node',
      capacity: 64 * 1024 * 1024, // 64MB
      used: 0,
      status: 'active',
      priority: 8,
      lastHeartbeat: new Date(),
      location: 'local'
    });

    // Buffer node
    this.addNode({
      id: 'buffer-node',
      capacity: 32 * 1024 * 1024, // 32MB
      used: 0,
      status: 'active',
      priority: 6,
      lastHeartbeat: new Date(),
      location: 'local'
    });
  }

  /**
   * Encode data to CBOR format
   */
  public encodeCBOR(data: CBORData): Buffer {
    try {
      const startTime = Date.now();
      
      // Add timestamp if not present
      if (!data.timestamp) {
        data.timestamp = Date.now();
      }

      // Compress large payloads
      let payload = data.payload;
      let compressed = false;
      
      const jsonSize = JSON.stringify(payload).length;
      if (jsonSize > this.compressionThreshold) {
        // Simple compression simulation (in real implementation use zlib)
        compressed = true;
        if (data.metadata) {
          data.metadata.compression = true;
        }
      }

      const cborData = {
        ...data,
        payload,
        _meta: {
          encoded: Date.now(),
          size: jsonSize,
          compressed
        }
      };

      const encoded = cbor.encode(cborData);
      const encodeTime = Date.now() - startTime;

      this.emit('cbor-encoded', {
        originalSize: jsonSize,
        cborSize: encoded.length,
        compressionRatio: jsonSize / encoded.length,
        encodeTime
      });

      return encoded;

    } catch (error) {
      console.error('[CBOR] Encoding error:', error);
      throw error;
    }
  }

  /**
   * Decode CBOR data
   */
  public decodeCBOR(buffer: Buffer): CBORData {
    try {
      const startTime = Date.now();
      const decoded = cbor.decode(buffer);
      const decodeTime = Date.now() - startTime;

      this.emit('cbor-decoded', {
        size: buffer.length,
        decodeTime,
        type: decoded.type
      });

      return decoded;

    } catch (error) {
      console.error('[CBOR] Decoding error:', error);
      throw error;
    }
  }

  /**
   * Store data in distributed nodes
   */
  public async storeData(key: string, data: CBORData): Promise<string[]> {
    const encoded = this.encodeCBOR(data);
    const chunks = this.splitIntoChunks(key, encoded);
    const chunkIds: string[] = [];

    for (const chunk of chunks) {
      const nodeId = this.selectOptimalNode(chunk.size);
      if (!nodeId) {
        throw new Error('No available nodes for storage');
      }

      chunk.nodeId = nodeId;
      this.chunks.set(chunk.id, chunk);
      
      // Update node usage
      const node = this.nodes.get(nodeId)!;
      node.used += chunk.size;
      
      chunkIds.push(chunk.id);

      this.emit('chunk-stored', {
        chunkId: chunk.id,
        nodeId,
        size: chunk.size,
        key
      });
    }

    return chunkIds;
  }

  /**
   * Retrieve data from distributed nodes
   */
  public async retrieveData(chunkIds: string[]): Promise<CBORData> {
    const chunks: Buffer[] = [];
    
    for (const chunkId of chunkIds) {
      const chunk = this.chunks.get(chunkId);
      if (!chunk) {
        throw new Error(`Chunk ${chunkId} not found`);
      }

      // Update access time
      chunk.accessed = new Date();
      
      // Simulate chunk retrieval (in real implementation would fetch from node)
      const chunkData = Buffer.alloc(chunk.size);
      chunks.push(chunkData);

      this.emit('chunk-retrieved', {
        chunkId,
        nodeId: chunk.nodeId,
        size: chunk.size
      });
    }

    // Reconstruct original data
    const reconstructed = Buffer.concat(chunks);
    return this.decodeCBOR(reconstructed);
  }

  /**
   * Add memory node
   */
  public addNode(node: MemoryNode): void {
    this.nodes.set(node.id, node);
    this.emit('node-added', node);
    console.log(`[Memory] Node added: ${node.id} (${this.formatBytes(node.capacity)})`);
  }

  /**
   * Remove memory node
   */
  public removeNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Migrate chunks from this node
    this.migrateChunksFromNode(nodeId);
    
    this.nodes.delete(nodeId);
    this.emit('node-removed', nodeId);
    console.log(`[Memory] Node removed: ${nodeId}`);
    return true;
  }

  /**
   * Select optimal node for storage
   */
  private selectOptimalNode(dataSize: number): string | null {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => 
        node.status === 'active' && 
        (node.capacity - node.used) >= dataSize
      )
      .sort((a, b) => {
        switch (this.distributionStrategy) {
          case 'least-used':
            return (a.used / a.capacity) - (b.used / b.capacity);
          case 'priority':
            return b.priority - a.priority;
          case 'round-robin':
          default:
            return Math.random() - 0.5;
        }
      });

    return availableNodes.length > 0 ? availableNodes[0].id : null;
  }

  /**
   * Split data into manageable chunks
   */
  private splitIntoChunks(key: string, data: Buffer): MemoryChunk[] {
    const chunks: MemoryChunk[] = [];
    const totalSize = data.length;
    const numChunks = Math.ceil(totalSize / this.maxChunkSize);

    for (let i = 0; i < numChunks; i++) {
      const start = i * this.maxChunkSize;
      const end = Math.min(start + this.maxChunkSize, totalSize);
      const chunkData = data.slice(start, end);
      
      const chunk: MemoryChunk = {
        id: `${key}_chunk_${i}`,
        nodeId: '', // Will be assigned during storage
        size: chunkData.length,
        checksum: this.calculateChecksum(chunkData),
        created: new Date(),
        accessed: new Date(),
        compressed: false,
        encrypted: false
      };

      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Calculate simple checksum
   */
  private calculateChecksum(data: Buffer): string {
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum ^= data[i];
    }
    return checksum.toString(16);
  }

  /**
   * Migrate chunks from a node
   */
  private async migrateChunksFromNode(nodeId: string): Promise<void> {
    const chunksToMigrate = Array.from(this.chunks.values())
      .filter(chunk => chunk.nodeId === nodeId);

    for (const chunk of chunksToMigrate) {
      const newNodeId = this.selectOptimalNode(chunk.size);
      if (newNodeId) {
        chunk.nodeId = newNodeId;
        
        // Update node usage
        const newNode = this.nodes.get(newNodeId)!;
        newNode.used += chunk.size;

        this.emit('chunk-migrated', {
          chunkId: chunk.id,
          fromNode: nodeId,
          toNode: newNodeId
        });
      }
    }

    // Clear usage from old node
    const oldNode = this.nodes.get(nodeId);
    if (oldNode) {
      oldNode.used = 0;
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    setInterval(() => {
      const now = new Date();
      
      for (const [nodeId, node] of this.nodes) {
        const timeSinceHeartbeat = now.getTime() - node.lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat > 30000) { // 30 seconds
          console.warn(`[Memory] Node ${nodeId} heartbeat timeout`);
          node.status = 'offline';
          this.emit('node-timeout', nodeId);
        }
      }
      
      this.performMaintenanceTasks();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Perform maintenance tasks
   */
  private performMaintenanceTasks(): void {
    // Clean up expired chunks
    const now = new Date();
    
    for (const [chunkId, chunk] of this.chunks) {
      if (chunk.ttl && (now.getTime() - chunk.created.getTime()) > chunk.ttl * 1000) {
        this.chunks.delete(chunkId);
        
        // Update node usage
        const node = this.nodes.get(chunk.nodeId);
        if (node) {
          node.used = Math.max(0, node.used - chunk.size);
        }

        this.emit('chunk-expired', chunkId);
      }
    }

    // Rebalance if needed
    this.rebalanceNodes();
  }

  /**
   * Rebalance nodes
   */
  private rebalanceNodes(): void {
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'active');

    if (activeNodes.length < 2) return;

    const avgUsage = activeNodes.reduce((sum, node) => sum + (node.used / node.capacity), 0) / activeNodes.length;
    
    for (const node of activeNodes) {
      const usage = node.used / node.capacity;
      
      if (usage > 0.9) { // Over 90% usage
        node.status = 'overloaded';
        this.emit('node-overloaded', node.id);
      } else if (node.status === 'overloaded' && usage < 0.7) {
        node.status = 'active';
        this.emit('node-recovered', node.id);
      }
    }
  }

  /**
   * Get system status
   */
  public getStatus() {
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      capacity: this.formatBytes(node.capacity),
      used: this.formatBytes(node.used),
      usage: `${((node.used / node.capacity) * 100).toFixed(1)}%`,
      status: node.status,
      priority: node.priority,
      location: node.location
    }));

    const totalCapacity = Array.from(this.nodes.values()).reduce((sum, node) => sum + node.capacity, 0);
    const totalUsed = Array.from(this.nodes.values()).reduce((sum, node) => sum + node.used, 0);

    return {
      nodes,
      chunks: this.chunks.size,
      totalCapacity: this.formatBytes(totalCapacity),
      totalUsed: this.formatBytes(totalUsed),
      utilization: `${((totalUsed / totalCapacity) * 100).toFixed(1)}%`,
      distributionStrategy: this.distributionStrategy,
      compressionThreshold: this.formatBytes(this.compressionThreshold),
      maxChunkSize: this.formatBytes(this.maxChunkSize)
    };
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  /**
   * Update distribution strategy
   */
  public setDistributionStrategy(strategy: 'round-robin' | 'least-used' | 'priority'): void {
    this.distributionStrategy = strategy;
    this.emit('strategy-changed', strategy);
    console.log(`[Memory] Distribution strategy changed to: ${strategy}`);
  }

  /**
   * Force node heartbeat
   */
  public heartbeat(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    node.lastHeartbeat = new Date();
    if (node.status === 'offline') {
      node.status = 'active';
      this.emit('node-recovered', nodeId);
    }

    return true;
  }
}

// Export singleton instance
export const cborMemoryManager = new CBORMemoryManager();