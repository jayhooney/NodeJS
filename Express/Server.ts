import Express from "express";
import BodyParser from "body-parser";
import Http from "http";
import Cors from "cors";
import Helmet from "helmet";
import { LogUtil } from "../util/LogUtil";
import { IpUtil } from "../util/IpUtil";
import { routerMap } from "./RouterMap";
import { Process } from "./Process";

export class Server {
  private mServer = Express();
  private mLogger = LogUtil.getInstance().logger;

  // CORS 이슈 처리
  private CORS_OPTIONS = {
    origin: "http://Address:Port", // 허락할 주소
    credentials: true, // 설정 내용을 Response 헤더에 추가
    exposedHeaders: ["propOne", "propTwo"], // 공개할 헤더 요소
  };

  private CreateServer = (): void => {
    this.mLogger.info("starting server . . . ");
    this.mServer.use(
      BodyParser.urlencoded({
        extended: true,
      })
    );

    this.mServer.use(Helmet());
    this.mServer.use(Helmet.expectCt());
    this.mServer.use(Helmet.noCache());
    this.mServer.use(Helmet.referrerPolicy());

    this.mServer.use(Cors(this.CORS_OPTIONS));
    this.mServer.use(BodyParser.json());

    Http.CreateServer(this.mServer).listen(
      Number(process.env.PORT),
      process.env.IPV4_FORMAT
    );

    const getLocalIp = IpUtil.getInstance().getLocalIp;
    this.mLogger.info(
      `server running at ${getLocalIp()}:${process.env.SERVER_PORT}`
    );
    this.mLogger.info("successfully started server");
  };

  // 아래와 같이
  // 라우팅 정보가 있는 Map과 forEach함수를 사용하여
  // 다수의 라우팅을 깔끔하게 처리할 수 있다 !
  private Route = (): void => {
    this.mLogger.info("routing start . . . ");
    const process: Process = new Process();

    routerMap.forEach((router) => {
      const method = router.method;
      const addr = router.addr;
      this.mLogger.debug(`[${method}] listening at ${addr}`);

      switch (method) {
        case "POST":
          this.mServer.post(addr, process.authProcess);
          break;
        case "GET":
          this.mServer.get(addr, process.authProcess);
          break;
        case "PUT":
          this.mServer.put(addr, process.authProcess);
          break;
        case "DELETE":
          this.mServer.delete(addr, process.authProcess);
          break;
        default:
          this.mLogger.debug("Default Case");
          break;
      }
    });
    this.mLogger.info("successfully routing server ! ! !");
  };

  serverStart = (): void => {
    this.mLogger.info("start init server");
    this.CreateServer();
    this.Route();
    this.mLogger.info("successfully init server");
  };
}
