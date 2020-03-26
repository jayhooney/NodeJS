import { S3 } from "aws-sdk";
import { LogUtil } from "./LogUtil";

export class UploadUtil {
  private mLogger = LogUtil.getInstance().logger;

  public upload2S3 = async (_filePath: string): Promise<void> => {
    const s3: S3 = new S3({
      accessKeyId: `AWS_ACCESS_KEY_ID`,
      secretAccessKey: `AWS_SECRET_ACCESS_KEY_ID`,
      region: `AWS_S3_REGION`
    });

    const buffer: Buffer = await this.readFile(_filePath);

    const params: S3.PutObjectRequest = {
      Bucket: `AWS_S3_BUCKET`,
      Key: _filePath,
      Body: buffer
    };

    this.mLogger.info(`Upload to S3 file : ${_filePath}`);

    s3.upload(params)
      .promise()
      .then((data: S3.ManagedUpload.SendData) => {
        this.mLogger.info(`Successfully uploaded to S3 : ${data.Location}`);
        this.removeFile(_filePath);
      })
      .catch(err => {
        this.mLogger.error(err);
      });
  };
}
