import { Markup } from "telegraf";
import { CommandInterface } from "./_interface";
import { shiroApi } from "../helpers/shiroApi";
import { waifuPicsApi } from "../helpers/waifuPicsApi";
import { ContextCallbackWithData } from "../typings/telegraf";
import i18n from "../helpers/localization";

export default class extends CommandInterface {
  constructor() {
    super({
      name: "hentai",
      description: "[NSFW]: Send hentai images",
      collectUsage: true,
      actions: [
        { name: i18n.translate("shiroService"), callback: "NEW_HENTAI_SHIRO" },
        { name: i18n.translate("waifuPicsService"), callback: "NEW_HENTAI_WAIFUPICS" },
      ],
    });
  }

  async run(ctx: ContextCallbackWithData) {
    const CBData = ctx.callbackQuery?.data;
    const keyboard = Markup.inlineKeyboard(
      this.actions.map((action) => Markup.button.callback(action.name, action.callback)),
      { columns: 1 },
    );

    if (!CBData || CBData == "NEW_HENTAI_SHIRO") {
      const images = await shiroApi({ endPoint: "nsfw/hentai", amount: 10 });

      await ctx.replyWithMediaGroup(
        images.map((image) => {
          return {
            type: "photo",
            media: image,
          };
        }),
      );
    }

    if (CBData == "NEW_HENTAI_WAIFUPICS") {
      const images = await waifuPicsApi({ endPoint: "nsfw/waifu", amount: 10 });

      await ctx.replyWithMediaGroup(
        images.map((image) => {
          return {
            type: "photo",
            media: image,
          };
        }),
      );
    }

    await ctx.reply(i18n.translate("newPackHentai"), keyboard);
  }
}
