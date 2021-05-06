import { createConnection } from "typeorm";
import { bot } from "../app";
import { Settings } from "../entities/Settings";

export async function readyEvent() {
    console.log(` > ${bot.botInfo.username} ready!`);

    const connection = await createConnection();
    connection.getRepository(Settings).create();

    if (!(await connection.getRepository(Settings).findOne(1))) {
        const setting = new Settings();
        setting.avatarUsed = 0;
        setting.bondageUsed = 0;
        setting.hentaiUsed = 0;
        setting.thighsUsed = 0;
        setting.uploadUsed = 0;
        setting.wallpaperUsed = 0;

        await connection.manager.save(setting);
    }

    await connection.close();
}
