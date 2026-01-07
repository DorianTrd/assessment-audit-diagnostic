import pino from "pino";
import fs from "fs";
import path from "path";

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logsDir, "app.log"), {
  flags: "a",
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  logStream
);

export default logger;