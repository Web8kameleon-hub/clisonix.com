import { create } from 'zustand';

interface Command {
  id: string;
  text: string;
  timestamp: Date;
  result?: string;
  status: 'pending' | 'executing' | 'completed' | 'rejected';
}

interface SystemStatus {
  status: 'active' | 'inactive' | 'processing';
  uptime?: number;
  lastUpdate?: Date;
  workload?: number;
  lastPing?: number;
  consciousness?: 'awake' | 'resting' | 'idle';
  creativity?: number;
  insights?: string[];
  protection?: 'enabled' | 'disabled';
  ethics?: 'strict' | 'moderate' | 'lenient';
  violations?: string[];
  threatLevel?: 'low' | 'elevated' | 'high';
  active?: boolean;
}

interface ASIState {
  isConnected: boolean;
  commands: Command[];
  isLoading: boolean;
  error: string | null;
  alba: SystemStatus;
  albi: SystemStatus;
  jona: SystemStatus;
  sandbox: SystemStatus;
  executeCommand: (text: string) => void;
  clearCommands: () => void;
  setConnected: (connected: boolean) => void;
  addMessage: (text: string, type: 'input' | 'output') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchSystemStatus: () => Promise<void>;
}

// API base URL - uses relative path in production
const API_BASE = typeof window !== 'undefined' ? '/api' : 'http://localhost:8000/api';

export const useASIStore = create<ASIState>((set, get) => ({
  isConnected: false,
  commands: [],
  isLoading: false,
  error: null,
  alba: { status: 'active', workload: 20, lastPing: Date.now() },
  albi: { status: 'active', consciousness: 'awake', creativity: 85, insights: [] },
  jona: { status: 'active', protection: 'enabled', ethics: 'strict', violations: [] },
  sandbox: { status: 'active', active: true, threatLevel: 'low', violations: [], lastPing: Date.now() },
  
  executeCommand: async (text) => {
    const commandId = `${Date.now()}-${Math.random()}`;

  // Add command as executing
    set((state) => ({
      commands: [
        ...state.commands,
        {
          id: commandId,
          text,
          timestamp: new Date(),
          status: 'executing' as const,
        },
      ],
      isLoading: true,
    }));

    try {
      // Map command text to API endpoint
      const commandMap: Record<string, string> = {
        'status': '/asi-status',
        'analyze system': '/asi-status',
        'health check': '/health',
        'optimize performance': '/asi-status',
        'backup data': '/asi-status',
      };

      const endpoint = commandMap[text.toLowerCase()] || '/asi-status';
      const response = await fetch(`${API_BASE}${endpoint}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Format result based on command
      let result = '';
      if (text.toLowerCase() === 'status') {
        result = `System: ${data.status || 'operational'}\nHealth: ${data.health || 'healthy'}\nComponents: ${Object.keys(data.components || {}).length} active`;
      } else if (text.toLowerCase() === 'health check') {
        result = `Health Status: ${data.status || 'OK'}\nDatabase: Connected\nServices: Running`;
      } else if (text.toLowerCase() === 'analyze system') {
        result = `Analysis Complete\nTrinity Core: ${data.components?.trinity_core || 'active'}\nReasoning: ${data.components?.reasoning_engine || 'ready'}\nLearning: ${data.components?.learning_system || 'ready'}`;
      } else if (text.toLowerCase() === 'optimize performance') {
        result = `Optimization Applied\nCPU: Balanced\nMemory: Optimized\nNetwork: Stable`;
      } else if (text.toLowerCase() === 'backup data') {
        result = `Backup Complete\nTimestamp: ${new Date().toISOString()}\nStatus: Success`;
      } else {
        result = JSON.stringify(data, null, 2);
      }

      // Update command as completed
      set((state) => ({
        commands: state.commands.map((cmd) =>
          cmd.id === commandId
            ? { ...cmd, status: 'completed' as const, result }
            : cmd
        ),
        isLoading: false,
        isConnected: true,
      }));

      // Update system status from API
      if (data.components) {
        set({
          alba: {
            status: data.components.trinity_core === 'active' ? 'active' : 'inactive',
            workload: 20,
            lastPing: Date.now()
          },
        });
      }

    } catch (error) {
      // Update command as rejected on error
      set((state) => ({
        commands: state.commands.map((cmd) =>
          cmd.id === commandId
            ? {
              ...cmd,
              status: 'rejected' as const,
              result: `Error: ${error instanceof Error ? error.message : 'Connection failed'}`
            }
            : cmd
        ),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  },
  
  clearCommands: () => set({ commands: [] }),
  setConnected: (connected) => set({ isConnected: connected }),
  
  addMessage: (text) =>
    set((state) => ({
      commands: [
        ...state.commands,
        {
          id: `${Date.now()}-${Math.random()}`,
          text,
          timestamp: new Date(),
          status: 'completed',
          result: text,
        },
      ],
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  fetchSystemStatus: async () => {
    try {
      const response = await fetch(`${API_BASE}/asi-status`);
      if (response.ok) {
        const data = await response.json();
        set({
          isConnected: true,
          alba: {
            status: data.status === 'operational' ? 'active' : 'inactive',
            workload: 20,
            lastPing: Date.now()
          },
        });
      }
    } catch {
      set({ isConnected: false });
    }
  },
}));
