import axios from "axios";
import { createConnection, getConnection } from "typeorm";
import { bot, fileType } from "../app";
import { Settings } from "../entities/Settings";

export async function thighsCallback(callback: any) {
    const output = await (
        await axios.get("https://shiro.gg/api/images/nsfw/thighs")
    ).data;

    if (!fileType.includes(output.fileType)) return;

    await bot.telegram.sendPhoto(
        callback.update.callback_query.message.chat.id,
        output,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Show new thighs image",
                            callback_data: "NEW_THIGHS",
                        },
                    ],
                ],
            },
        }
    );

    if (getConnection().isConnected) return;

    const connection = await createConnection();
    const dbRepo = connection.getRepository(Settings);
    const dbRepoUpdate = await dbRepo.findOne(1);
    dbRepoUpdate.thighsUsed = dbRepoUpdate.hentaiUsed + 1;
    await dbRepo.save(dbRepoUpdate);
    await connection.close();

    return;
}
