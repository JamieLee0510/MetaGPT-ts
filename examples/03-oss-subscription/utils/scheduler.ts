import * as cron from "node-cron";
import * as moment from "moment-timezone";

import { OssWatcher } from "../role";

// webhook

export const scheduleScraping = (url: string) => {
  const timeZone = "Asia/Taipei";
  // execute every 9am
  cron.schedule(
    "0 9 * * *",
    async () => {
      const currentTime = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
      console.log(`Starting the OssWatcher Job as ${currentTime}`);
      try {
        const ossWatcher = new OssWatcher();
        const result = await ossWatcher.run(url);
        // TODO: webhook
        console.log(result);
      } catch (err: any) {
        console.error(err.message);
      }
    },
    { timezone: timeZone },
  );
};
