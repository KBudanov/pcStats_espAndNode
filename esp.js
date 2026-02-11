import fetch from "node-fetch";

export async function sendToESP(stats) {
  try {
    await fetch("http://192.168.0.113/data", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stats)
    });
    console.log("Sent to ESP32");
  } catch (err) {
    console.log("Failed to send to ESP", err);
  }
}
