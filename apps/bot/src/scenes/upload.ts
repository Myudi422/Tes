import { Context, Markup, Scenes } from "telegraf";
import { getRepository } from "typeorm";
import { Collection, Upload } from "@riddea/typeorm";
import base64Data from "../helpers/base64Decoder";
import { botLogger } from "../helpers/logger";
import { File, Message } from "typegram";
import { uploadFile } from "../libs/s3";
import { bot } from "../app";
import i18n from "../helpers/localization";

async function getKeyboard(ctx: Context) {
  try {
    const collections = await getRepository(Collection).find({
      where: { userID: ctx.from.id },
      order: { createdAt: "DESC" },
    });

    const collectionsList = collections.map((c) =>
      Markup.button.callback(`${c.isPublic ? "🔓" : "🔒"} ${c.name}`, `IMAGE_ADD_COLLECTION_${c.id}`),
    );
    collectionsList.push({ text: i18n.translate("skip"), callback_data: "IMAGE_ADD_COLLECTION_SKIP", hide: false });

    const keyboard = Markup.inlineKeyboard(collectionsList, { columns: 1 });

    return keyboard;
  } catch (err) {
    botLogger.error(`Scene upload error:`, err.stack);
  }
}

export const uploadScene = new Scenes.BaseScene<Scenes.SceneContext>("upload")
  .enter((ctx) => {
    try {
      ctx.reply(i18n.translate("sendImage"));
    } catch (err) {
      botLogger.error(`Scene upload error:`, err.stack);
    }
  })
  .on("photo", async (ctx) => {
    try {
      await ctx.replyWithPhoto(ctx.message.photo.pop().file_id, await getKeyboard(ctx));
    } catch (err) {
      botLogger.error(`Scene upload error:`, err.stack);
    }
  })
  .action(/IMAGE_ADD_COLLECTION_\d+/, async (ctx) => {
    try {
      await ctx.answerCbQuery();
      const message = ctx.update.callback_query.message as Message & { photo: File[] };
      const photo = message.photo.pop() as File;
      const id = Number(ctx.match.input.replace("IMAGE_ADD_COLLECTION_", ""));
      const collectionName = (await getRepository(Collection).findOne({ id })).name;

      await saveAndUploadPhoto({ collectionId: id, photo, userID: ctx.from.id });

      await ctx.reply(i18n.translate("newImageCollection", { name: collectionName }));
      await ctx.deleteMessage(ctx.message);
    } catch (err) {
      botLogger.error(`Scene upload error:`, err.stack);
    }
  })
  .action("IMAGE_ADD_COLLECTION_SKIP", async (ctx) => {
    try {
      await ctx.answerCbQuery();

      const message = ctx.update.callback_query.message as Message & { photo: File[] };
      const photo = message.photo.pop() as File;

      await saveAndUploadPhoto({ photo, userID: ctx.from.id });

      await ctx.reply(i18n.translate("newImageNoCollection"));
      await ctx.deleteMessage(ctx.message);
    } catch (err) {
      botLogger.error(`Scene upload error:`, err.stack);
    }
  })
  .command("cancel", async (ctx) => {
    try {
      await ctx.scene.leave();
      await ctx.reply(i18n.translate("newImageLeave"));
    } catch (err) {
      botLogger.error(`Scene upload error:`, err.stack);
    }
  })
  .on("message", async (ctx) => {
    try {
      await ctx.reply(i18n.translate("noImageUpload"));
    } catch (err) {
      botLogger.error(`Scene upload error:`, err.stack);
    }
  });

const saveAndUploadPhoto = async ({ collectionId, userID, photo }: { collectionId?: number; userID: number; photo: File }) => {
  const base64 = await base64Data(photo);
  const fileName = (await bot.telegram.getFile(photo.file_id)).file_path.replace("photos/", "");

  await uploadFile({ buffer: base64, filePath: `${userID}/${fileName}` });

  await getRepository(Upload).save({
    userID,
    fileID: photo.file_id,
    fileName,
    collection: collectionId ? { id: collectionId } : undefined,
  });
};
