"use server";

import { emitSignal } from "../_shared/signal";

export interface NeuralActivity {
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
  dominant: number;
}

export interface RebalanceSession {
  startedAt: Date;
  durationSec: number;
  cycles: number;
  completed: boolean;
  calmLevel: number;
}

let activeSession: RebalanceSession | null = null;
let t = 0; // time index for sine wave

// Ì∑† Monitoron aktivitetin neural dhe aktivizon qet√´simin n√´se beta/gamma jan√´ t√´ larta
export async function monitorAndRebalance(activity: NeuralActivity): Promise<RebalanceSession | null> {
  if (activity.beta > 25 && activity.gamma > 35) {
    console.log("‚ö†Ô∏è [JONA] Elevated beta/gamma detected ‚Äî initiating rhythmic calm protocol");
    return await startCalmSession();
  }
  return null;
}

// Ìºä Fillon sesionin e qet√´simit ritmik
export async function startCalmSession(): Promise<RebalanceSession> {
  if (activeSession) return activeSession;

  const session: RebalanceSession = {
    startedAt: new Date(),
    durationSec: 0,
    cycles: 0,
    completed: false,
    calmLevel: 0,
  };

  activeSession = session;
  await emitSignal("JONA", "rebalance_start", { module: "ALBI", session });

  console.log("Ìº¨Ô∏è [ALBI] Rhythmic Calm Mode activated (Alpha‚ÄìTheta sync)");

  // val√´ ritmike ~0.1 Hz (6 cikle/minut√´) p√´r frym√´marrje qet√´suese
  const interval = setInterval(async () => {
    if (!activeSession) return;

    t += 0.1;
    const alpha = 8 + Math.sin(t) * 0.3; // 7.7‚Äì8.3 Hz
    const theta = 5 + Math.cos(t / 2) * 0.2; // 4.8‚Äì5.2 Hz

    activeSession.cycles++;
    activeSession.durationSec += 5;
    activeSession.calmLevel = Math.min(1, activeSession.calmLevel + 0.1);

    await emitSignal("ALBI", "neural_wave", {
      alpha,
      theta,
      calmLevel: activeSession.calmLevel,
      rhythmic: true,
    });

    console.log(
      `Ìæµ [ALBI] Calm cycle ${activeSession.cycles} | Alpha ${alpha.toFixed(2)}Hz | Theta ${theta.toFixed(2)}Hz | CalmLevel ${(activeSession.calmLevel * 100).toFixed(0)}%`
    );

    if (activeSession.calmLevel >= 1) {
      clearInterval(interval);
      await completeCalmSession();
    }
  }, 5000);

  return session;
}

// ‚úÖ P√´rfundon sesionin e qet√´simit
export async function completeCalmSession(): Promise<void> {
  if (!activeSession) return;

  activeSession.completed = true;
  console.log(`‚úÖ [JONA] Rhythmic Rebalance complete ‚Ä¢ Duration: ${activeSession.durationSec}s ‚Ä¢ Cycles: ${activeSession.cycles}`);
  await emitSignal("JONA", "rebalance_complete", { ...activeSession });
  activeSession = null;
}

// Ì¥ç Merr sesionin aktiv
export function getActiveSession(): RebalanceSession | null {
  return activeSession;
}
