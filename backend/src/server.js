import { createApp } from "./app.js";
import { testDbConnection } from "./db.js";
import { config } from "./config.js";

const app = createApp();

async function start() {
  try {
    const ok = await testDbConnection();
    if (!ok) {
      throw new Error("Database connection failed");
    }

    app.listen(config.port, () => {
      console.log(`Backend running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

start();
