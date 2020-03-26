import { AuthUtil } from "../util/AuthUtil";
import { IpUtil } from "../util/IpUtil";
import { Request, Response } from "express";

/**
 * 서버 프로세스
 *
 * @export
 * @class Process
 */
export class Process {
  public authProcess = (_req: Request, _res: Response): void => {
    const keyReader: Function = AuthUtil.getInstance().keyReader;
    const ipCheck: Function = IpUtil.getInstance().ipCheck;

    // Request 헤더에 담긴 정보 가져오기
    const hostIp: string = _req.ip;
    const hostId: string = _req.header("id");
    const authKey: string = _req.header("key");

    if (keyReader(authKey) && ipCheck(hostId, hostIp)) {
      console.log("인증 성공!");
    } else {
      // 패킷 인증 실패
      console.log("인증 실패!");
    }
  };
}
