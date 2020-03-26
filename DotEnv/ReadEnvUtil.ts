import Dotenv, { DotenvConfigOptions, DotenvConfigOutput } from "dotenv";
import FS from "fs-extra";
import { LogUtil } from "./LogUtil";

export class ReadEnvUtil {
  private mLogger = LogUtil.getInstance().logger;

  public readEnv = (): boolean => {
    let isReadEnvSuccess: boolean = false;
    const nodeEnv: string = process.env.NODE_ENV;
    const distributionTarget: string = process.env.DISTRIBUTION_TARGET;
    const envFileName: string = `${distributionTarget}_${nodeEnv}.env`;

    this.mLogger.debug(`start read ${envFileName} `);

    const options: DotenvConfigOptions = {
      path: `../${envFileName}`
    };

    const isExsist: boolean = FS.statSync(options.path).isFile();
    if (isExsist) {
      this.mLogger.info(`Successfully read env file`);
      const result: DotenvConfigOutput = Dotenv.config(options);
      this.mLogger.debug(result.parsed);
      isReadEnvSuccess = true;
    } else {
      this.mLogger.error(`NOT EXSIST ENV FILE ! ! PLEASE CHECK ENV FILE `);
    }

    return isReadEnvSuccess;
  };
}
