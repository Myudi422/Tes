import { Scenes, session, Telegraf } from "telegraf";

import { stage } from "./constants/stages";
import photoEvent from "./events/photo";
import readyEvent from "./events/ready";
import { loadCommands } from "./helpers/loadCommands";
import { botLogger } from "./helpers/logger";
import { setupS3 } from "./libs/s3";
import i18nMiddleware from "./middlewares/i18n";
import userMiddleware from "./middlewares/user";

export const bot = new Telegraf<Scenes.SceneContext>(process.env.TELEGRAM_BOT_TOKEN);

bot.use(userMiddleware, i18nMiddleware, session(), stage.middleware());
bot.on("photo", photoEvent);

export async function bootstrap() {
  try {
    await setupS3();
    await loadCommands();
    await bot.launch();
    await readyEvent();
  } catch (err) {
    botLogger.error(`App boot error:`, err.stack);
  }
}

async function shutDownServices() {
  bot.stop();
  process.exit(0);
}

bot.catch((err: Error) => {
  botLogger.error(`Main app error:`, err.stack);
});

process
  .on("SIGINT", () => shutDownServices())
  .on("SIGTERM", () => shutDownServices())
  .on("unhandledRejection", (reason) => botLogger.error(reason))
  .on("uncaughtException", (reason) => botLogger.error(reason));
