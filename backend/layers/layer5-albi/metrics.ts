import {
  BirthMetrics,
  BornIntelligence,
  LaborMetrics,
  LaborProcessResults,
} from "./types";

interface LaborCycleRecord {
  timestamp: Date;
  laborResults: LaborProcessResults;
}

export class ALBIMetrics {
  private laborHistory: LaborCycleRecord[] = [];
  private birthHistory: BornIntelligence[] = [];

  async recordLaborCycle(results: LaborProcessResults): Promise<void> {
    this.laborHistory.push({ timestamp: new Date(), laborResults: results });
    if (this.laborHistory.length > 500) {
      this.laborHistory = this.laborHistory.slice(-500);
    }
  }

  async recordBirth(intelligence: BornIntelligence): Promise<void> {
    this.birthHistory.push(intelligence);
    if (this.birthHistory.length > 200) {
      this.birthHistory = this.birthHistory.slice(-200);
    }
  }

  async summarizeLabor(): Promise<LaborMetrics> {
    if (this.laborHistory.length === 0) {
      return {
        totalProcessed: 0,
        successfulLabor: 0,
        failedLabor: 0,
        averageProcessingTime: 0,
        activeProcesses: 0,
      };
    }

    let totalProcessed = 0;
    let totalProcessingTime = 0;

    for (const record of this.laborHistory) {
      for (const result of Object.values(record.laborResults)) {
        totalProcessed += 1;
        totalProcessingTime += result.processingTime;
      }
    }

    return {
      totalProcessed,
      successfulLabor: totalProcessed,
      failedLabor: 0,
      averageProcessingTime: totalProcessingTime / Math.max(1, totalProcessed),
      activeProcesses: 0,
    };
  }

  async summarizeBirths(): Promise<BirthMetrics> {
    if (this.birthHistory.length === 0) {
      return {
        totalBirths: 0,
        successfulBirths: 0,
        failedBirths: 0,
        averageGestation: 0,
      };
    }

    const totalBirths = this.birthHistory.length;
    const successfulBirths = this.birthHistory.filter((entry) => entry.birthMetrics?.activationSuccess).length;
    const averageGestation = this.birthHistory
      .map((entry) => entry.birthMetrics?.gestationTime ?? 0)
      .reduce((sum, value) => sum + value, 0) /
      totalBirths;

    return {
      totalBirths,
      successfulBirths,
      failedBirths: totalBirths - successfulBirths,
      averageGestation,
    };
  }

  async getRecentBirths(hours = 24): Promise<BornIntelligence[]> {
    const threshold = Date.now() - hours * 60 * 60 * 1000;
    return this.birthHistory.filter((entry) => entry.birthTimestamp.getTime() >= threshold);
  }
}
