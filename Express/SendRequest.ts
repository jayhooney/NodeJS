import request from "request-promise-native";
import { IpUtil } from "../util/IpUtil";
import { LogUtil } from "../util/LogUtil";
import { RequestMap, IRequestInfo } from "../define/RequestMap";

export class SendRequest {
  public delivery = async (
    _reqCode: number,
    _reqItems: object
  ): Promise<any> => {
    const reqInfo: IRequestInfo = RequestMap.get(_reqCode);
    const logger = LogUtil.getInstance().logger;

    let options = {
      uri: `${SERVER_PROTOCOL}${SERVER_IP}:${SERVER_PORT}${reqInfo.addr}`,
      method: reqInfo.method,
      headers: {
        id: "serverId",
        key: "serverKey",
        code: "requestCode"
      },
      json: true,
      resolveWithFullResponse: true
    };

    switch (reqInfo.method) {
      case `GET`:
      case `DELETE`:
        options["qs"] = _reqItems;
        break;
      case `POST`:
      case `PUT`:
        options["body"] = _reqItems;
        break;
    }

    await request(options)
      .then(res => {
        const keyReader: Function = AuthUtil.getInstance().keyReader;
        const ipCheck: Function = IpUtil.getInstance().ipCheck;
        const hostId: string = String(res.headers.id);
        const hostIp: string = String(res.request.host);
        const key: string = String(res.headers.key);

        if (keyReader(key) && ipCheck(hostId, hostIp)) {
          logger.info(
            `${
              RequestMap.get(_reqCode).name
            } request was delivered to SERVER(${SERVER_IP})!`
          );
          const data = res.body.data;
          logger.debug(`response data from SERVER :`);
          logger.debug(data);
        }
      })
      .catch(err => {
        logger.error(err);
      });
  };
}
