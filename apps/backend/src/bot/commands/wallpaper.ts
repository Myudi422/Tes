import { Markup } from "telegraf";

import { shiroApi } from "../helpers/shiroApi";
import { ContextCallbackWithData } from "../typings/telegraf";
import { CommandInterface } from "./_interface";

export default class extends CommandInterface {
  constructor() {
    super({
      name: "wallpaper",
      description: "Send wallpaper images",
      collectUsage: true,
      cooldown: true,
      actions: [
        {
          name: "Shiro Service",
          callback: "NEW_WALLPAPER_SHIRO",
        },
      ],
    });
  }

  async run(ctx: ContextCallbackWithData) {
    const CBData = ctx.callbackQuery?.data;
    const keyboard = Markup.inlineKeyboard(
      this.actions.map((action) => Markup.button.callback(action.name, action.callback)),
      { columns: 1 },
    );

    if (!CBData || CBData == "NEW_WALLPAPER_SHIRO") {
      const images = await shiroApi({ endPoint: "wallpapers", amount: 10 });

      await ctx.replyWithMediaGroup(
        images.map((image) => {
          return {
            type: "photo",
            media: image,
          };
        }),
      );
    }

    await ctx.reply(ctx.i18n.translate("bot.main.newPack.images", { pack: ctx.i18n.translate("bot.packs.wallpaper") }), keyboard);
  }
}