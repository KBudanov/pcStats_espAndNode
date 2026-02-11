import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { getStats } from "./stats.js";
import { db, saveStats } from "./db.js";
import { sendToESP } from "./esp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


setInterval(async () => {
  try {
    const stats = await getStats();
    saveStats(db, stats);
    await sendToESP(stats);
   
  } catch (err) {
    console.error("Get info error:", err.message);
  }
}, 5000);


function getMiddleValue(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
app.get("/", (req, res) => {
  db.all("SELECT * FROM stats ORDER BY timestamp DESC LIMIT 50", (err, rows) => {
    if (err) return res.send("DB error");

    const cpuTemps = rows.map(r => r.cpuTemp);
    const gpuTemps = rows.map(r => r.gpuTemp);
    const powers = rows.map(r => r.totalPower);
    const rams = rows.map(r => r.ramUsed);
    const uptimes = rows.map(r => r.sessionUptimeFormatted); 

    res.render("dashboard", {
      stats: {
        cpuTemp: { latest: cpuTemps[0] ?? 0, middle: getMiddleValue(cpuTemps) },
        gpuTemp: { latest: gpuTemps[0] ?? 0, middle: getMiddleValue(gpuTemps) },
        power: { latest: powers[0] ?? 0, middle: getMiddleValue(powers) },
        ramUsed: { latest: rams[0] ?? 0, middle: getMiddleValue(rams) },
        sessionUptime: uptimes[0] ?? "0h 0m 0s" 
      }
    });
  });
});

app.get("/api/stats", (req, res) => {
  db.get("SELECT * FROM stats ORDER BY timestamp DESC LIMIT 1", (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(row);
  });
});

 


app.listen(3000, () =>
  console.log(" http://localhost:3000")
);
