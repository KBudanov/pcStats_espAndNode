import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./stats.db");


db.run(`
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER,
  cpuTemp REAL,
  gpuTemp REAL,
  cpuPower REAL,
  gpuPower REAL,
  totalPower REAL,
  ramUsed REAL,
  uptime INTEGER,
  sessionUptimeFormatted TEXT
)
`);

export function saveStats(db, stats) {
  db.run(
    `
    INSERT INTO stats (
      timestamp, 
      cpuTemp,
      gpuTemp,
      cpuPower,
      gpuPower,
      totalPower,
      ramUsed,
      uptime,
      sessionUptimeFormatted
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      stats.timestamp,
      stats.cpuTemp,
      stats.gpuTemp,
      stats.cpuPower,
      stats.gpuPower,
      stats.totalPower,
      stats.ramUsed,
      stats.sessionUptimeSeconds,       
      stats.sessionUptimeFormatted      
    ]
  );
}
