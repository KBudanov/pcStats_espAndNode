import si from "systeminformation";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

async function getNvidiaGpuPower() {
  try {
    const { stdout } = await execAsync(
      "nvidia-smi --query-gpu=power.draw --format=csv,noheader,nounits"
    );
    return Number(stdout.trim());
  } catch {
    return 0;
  }
}


function getSessionUptime() {
  const seconds = process.uptime();
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return { seconds, formatted: `${h}h ${m}m ${s}s` };
}

export async function getStats() {
  const [cpuTemp, mem, graphics, gpuPower] = await Promise.all([
    si.cpuTemperature(),
    si.mem(),
    si.graphics(),
    getNvidiaGpuPower()
  ]);

  const gpu = graphics.controllers?.[0] || {};
  const sessionUptime = getSessionUptime();

  return {
    timestamp: Date.now(),
    cpuTemp: cpuTemp.main ?? 0,
    gpuTemp: gpu.temperatureGpu ?? 0,
    gpuPower: gpuPower,
    totalPower: gpuPower, 
    ramUsed: Number(((mem.used / mem.total) * 100).toFixed(1)),
    sessionUptimeFormatted: sessionUptime.formatted
  };
}
