import express from "express";
import loaders from "./loaders";
import log from "./loggers";
import Colors = require("colors.ts");
const dotenv = require("dotenv");
Colors.enable();

// Load env vars
dotenv.config({ path: "./config/config.env" });

const port = process.env.PORT;

async function startServer() {
  const app = express();

  // time to load all the loaders before starting the app
  await loaders(app);

  app.listen(port, () => {
    log.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${port}`.yellow
    );
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err: Error, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    // server.close(() => process.exit(1));
  });
}
startServer();
