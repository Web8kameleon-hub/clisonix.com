/**
 * ASI Frontend Components
 * ======================
 * 
 * React components for the ASI (Artificial Superintelligence) system interface
 * using framer-motion, class-variance-authority (cva), and vanilla-extract.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, VariantProps } from 'class-variance-authority';
import { style, globalStyle } from '@vanilla-extract/css';

// Global styles
globalStyle('*', {
  margin: 0,
  padding: 0,
  boxSizing: 'border-box',
});

globalStyle('body', {
  fontFamily: '"Inter", system-ui, sans-serif',
  backgroundColor: '#0a0a0a',
  color: '#ffffff',
  lineHeight: 1.6,
});

// Styled components with vanilla-extract
const asiContainer = style({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
  padding: '2rem',
  position: 'relative',
  overflow: 'hidden',
});

const headerStyle = style({
  textAlign: 'center',
  marginBottom: '3rem',
  position: 'relative',
  zIndex: 2,
});

const titleStyle = style({
  fontSize: '3.5rem',
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, #00f5ff, #0080ff, #8000ff)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  marginBottom: '1rem',
  textShadow: '0 0 30px rgba(0, 245, 255, 0.3)',
});

const subtitleStyle = style({
  fontSize: '1.2rem',
  color: '#b0b0b0',
  marginBottom: '2rem',
});

const agentGridStyle = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  marginBottom: '3rem',
  zIndex: 2,
  position: 'relative',
});

const terminalStyle = style({
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: '1.5rem',
  fontFamily: '"Fira Code", monospace',
  minHeight: '400px',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  zIndex: 2,
});

const backgroundParticle = style({
  position: 'absolute',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(0, 245, 255, 0.1) 0%, transparent 70%)',
  pointerEvents: 'none',
});

// CVA button variants
const buttonVariants = cva(
  'px-6 py-3 rounded-lg font-semibold transition-all duration-300 border',
  {
    variants: {
      variant: {
        alba: 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white',
        albi: 'bg-green-600 hover:bg-green-700 border-green-500 text-white',
        jona: 'bg-purple-600 hover:bg-purple-700 border-purple-500 text-white',
        asi: 'bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 hover:from-blue-700 hover:via-purple-700 hover:to-green-700 border-cyan-400 text-white',
        danger: 'bg-red-600 hover:bg-red-700 border-red-500 text-white',
        ghost: 'bg-transparent hover:bg-white/10 border-gray-600 text-gray-300',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'asi',
      size: 'md',
    },
  }
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const agentCardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

// Types
interface Agent {
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'processing';
  health: number;
  color: string;
}

interface ASITerminalProps {
  commands: string[];
  onCommand: (command: string) => void;
}

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

// Components
const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff88';
      case 'processing': return '#ffaa00';
      case 'inactive': return '#ff4444';
      default: return '#888888';
    }
  };

  return (
    <motion.div
      className={`bg-gray-900/50 backdrop-blur-sm border rounded-xl p-6 cursor-pointer`}
      style={{ borderColor: agent.color }}
      variants={agentCardVariants}
      whileHover="hover"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold" style={{ color: agent.color }}>
          {agent.name}
        </h3>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getStatusColor(agent.status) }}
        />
      </div>
      
      <p className="text-gray-400 mb-4">{agent.role}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Status:</span>
          <span style={{ color: getStatusColor(agent.status) }}>
            {agent.status.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Health:</span>
          <span className={agent.health > 80 ? 'text-green-400' : agent.health > 50 ? 'text-yellow-400' : 'text-red-400'}>
            {agent.health}%
          </span>
        </div>
      </div>
      
      {/* Health bar */}
      <div className="mt-4 bg-gray-700 rounded-full h-2">
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: agent.color }}
          initial={{ width: 0 }}
          animate={{ width: `${agent.health}%` }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

const ASITerminal: React.FC<ASITerminalProps> = ({ commands, onCommand }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    '🤖 ASI Terminal initialized...',
    '🔐 Safety sandbox active',
    '🌐 Network monitoring online',
    '✅ All agents operational',
    '',
    'Type "help" for available commands',
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setHistory(prev => [...prev, `> ${input}`, '']);
      onCommand(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (commands.length > 0) {
      const latestCommand = commands[commands.length - 1];
      setHistory(prev => [...prev, `✓ ${latestCommand}`, '']);
    }
  }, [commands]);

  return (
    <div className={terminalStyle}>
      <div className="flex items-center mb-4 pb-2 border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="ml-4 text-gray-400 text-sm">ASI Terminal v1.0</span>
      </div>
      
      <div className="text-sm text-green-400 mb-4 h-64 overflow-y-auto">
        {history.map((line, index) => (
          <div key={index} className="mb-1">
            {line}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex">
        <span className="text-cyan-400 mr-2">ASI&gt;</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent text-white outline-none"
          placeholder="Enter command..."
          autoFocus
        />
      </form>
    </div>
  );
};

const BackgroundParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 100 + 50,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={backgroundParticle}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -100, 100, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </>
  );
};

// Main ASI Dashboard Component
const ASIDashboard: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      name: 'Alba',
      role: 'Network Infrastructure Monitor',
      status: 'active',
      health: 94,
      color: '#00aaff',
    },
    {
      name: 'Albi',
      role: 'Process Automation Engine',
      status: 'active',
      health: 87,
      color: '#00ff88',
    },
    {
      name: 'Jona',
      role: 'Human-AI Communication Bridge',
      status: 'processing',
      health: 92,
      color: '#aa00ff',
    },
  ]);

  const [commands, setCommands] = useState<string[]>([]);

  const handleAgentClick = (agent: Agent) => {
    console.log(`Agent ${agent.name} clicked`);
    // Handle agent interaction
  };

  const handleCommand = (command: string) => {
    setCommands(prev => [...prev, command]);
    
    // Simulate command processing
    setTimeout(() => {
      // Update agent status based on command
      if (command.includes('status')) {
        console.log('Status check completed');
      }
    }, 1000);
  };

  return (
    <div className={asiContainer}>
      <BackgroundParticles />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className={headerStyle} variants={itemVariants}>
          <h1 className={titleStyle}>ASI System</h1>
          <p className={subtitleStyle}>
            Artificial Superintelligence • Trinity Architecture
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button
              className={buttonVariants({ variant: 'alba', size: 'sm' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Network Status
            </motion.button>
            <motion.button
              className={buttonVariants({ variant: 'albi', size: 'sm' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Process Monitor
            </motion.button>
            <motion.button
              className={buttonVariants({ variant: 'jona', size: 'sm' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              AI Chat
            </motion.button>
          </div>
        </motion.header>

        <motion.div className={agentGridStyle} variants={itemVariants}>
          <AnimatePresence>
            {agents.map((agent) => (
              <AgentCard
                key={agent.name}
                agent={agent}
                onClick={() => handleAgentClick(agent)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ASITerminal commands={commands} onCommand={handleCommand} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ASIDashboard;