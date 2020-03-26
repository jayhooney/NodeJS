import FS from "fs-extra";
import { LogUtil } from "./LogUtil";

export class FileUtil {
  // 싱글톤 패턴
  private static instance: FileUtil;
  private constructor() {}
  public static getInstance(): FileUtil {
    if (!FileUtil.instance) {
      FileUtil.instance = new FileUtil();
    }

    return FileUtil.instance;
  }

  private mLogger = LogUtil.getInstance().logger;

  // Promise 기반의 파읽 쓰기
  public writeFile = async (
    _filePath: string,
    _content: object[]
  ): Promise<void> => {
    this.mLogger.info(`Write file : ${_filePath}`);
    // 파일 존재 유무 확인
    await FS.ensureDir(_filePath);
    await FS.writeFile(
      _filePath,
      JSON.stringify(_content),
      process.env.CHARACTER_SET
    )
      .then(() => {
        this.mLogger.info(`Successfully written`);
      })
      .catch(err => {
        this.mLogger.error(err);
      });
  };

  // Promise 기반의 파일 읽기
  public readFile = async (_filePath: string): Promise<Buffer> => {
    this.mLogger.info(`Read file : ${_filePath}`);
    let fileBuffer: Buffer;
    await FS.readFile(_filePath)
      .then((buffer: Buffer) => {
        this.mLogger.info(`Successfully read (size : ${buffer.length})`);
        fileBuffer = buffer;
      })
      .catch(err => {
        this.mLogger.error(err);
      });

    return fileBuffer;
  };

  // Promise 기반의 파일 제거
  public removeFile = async (_filePath: string): Promise<void> => {
    this.mLogger.info(`Remove file : ${_filePath}`);
    await FS.unlink(_filePath)
      .then(() => {
        this.mLogger.info(`Successfully removed`);
      })
      .catch(err => {
        this.mLogger.error(err);
      });
  };
}
