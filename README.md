# NodeJS 개발을 진행하며 남기는 기록

---

## Express

#### Server.ts

```
기본적인 HTTP 서버 생성 로직.
```

```
CORS 이슈 처리
서버와 통신하는 웹페이지에서 같은 주소,포트를 사용하지 않을 때 CORS 이슈가 생긴다.
해당 이슈자체는 cors 라는 모듈을 사용해 해결했는데 보안취약점이 발생하게 된다.
따라서 이 모듈을 사용할 땐 내가 필요한 옵션이 무엇인지  이 링크를 통해 확인 후 적절하게 진행해야 한다!
```

> 참고 : <https://www.npmjs.com/package/cors>

```
Helmet 모듈 적용
데이터 수집,분석 웹 서비스를 개발하면서 최소한의 보안은 챙겨야하지 않을까 싶어 알아보다가 아래 문서를 읽게 됐다.
express 는 helmet과 좋은 연동성을 가지고 있어서 바로 적용!
아래 참고링크의 가이드를 따르려고 노력했다.
```

> 참고 : <https://expressjs.com/ko/advanced/best-practice-security.html>

#### Server.ts & RouterMap.ts

```
라우팅해야할 것이 너무 많다면..?
Map과 forEach 함수로 깔끔하게 라우팅!
```

#### Process.ts

```
Request객체의 Header에서 필요한 정보를 가져와 패킷을 인증하는 간단 로직.
```

#### SendRequest.ts

```
통신 순서를 보장받아야할 때가 간혹있는데,
Express에서 제공하는 Request객체는 비동기로 작동하여 처리결과를 보장받고 다음 단계로 넘어가는 로직을 작성할 때 코드량이 많아지고 가독성이 떨어졌다.
그러하여 찾아보니 request-promise-native 라는 훌륭한 모듈이 있었다..!
통신 한 번에 하나의 Promise를 반환해줘서 순차적을 통신해야할 때 아주 용이했다
옵션에 따라 Response 객체의 Header에서 필요한 정보를 가져올 수 있다.
```

---

## FS-Extra

#### FileUtil.ts

```
기본적으로 비동기로 작동하는 파일 존재 유무,쓰기,읽기 그리고 지우기 작업을
Promise를 반환받아 처리결과를 보장받고 다음 작업을 진행하도록 구현한 로직
좀 더 일찍 알았다면 좋았을텐데, 모듈 내부를 뜯어보고 나서인 최근에야 알게됐다...
```

---

## Puppeteer

> Puppeteer 공식문서 : <https://pptr.dev/>

#### PageUtil.ts

```
Puppeteer 모듈을 사용하여 웹 크롤링을 할 수 있도록 각 단계별로 작성해놓은 로직.
크게 세 단계로 나뉜다.
1. 링크 이동
2. 스크립트 인젝팅
3. 크롤링
위 세 단계에서 필요에 따라 intercept, interval, dialog, headless 옵션을 조정할 수 있다.
가장 중요한건 Evaluate 함수인데 인젝팅된 스크립트를 Serializable한 상태로 변환후 파라미터로 넘겨줘야한다.
쉽게 말해서, 실제로 CSS Selector가 적용될 스크립트파일 이름을 문자열로 넘겨줘야 Evaluate 함수가 작동한다.
```

#### List.ts & Document.ts

```
CSS Selector를 적용할 수 있도록 작성한 스크립트 파일.
웹 크롤링 과정을 크게 아래와 같은 두 단계로 나눠서 진행했다.
1. 링크수집
2. 원문수집
List.ts와 Document.ts는 각각 링크,원문을 수집할 수 있도록 작성해놓은 인젝팅용 스크립트며
CSS Selector가 정상적용되면 크롤링 결과들을 취합하여 오브젝트 형태로 반환해주도록 구현했다.
정상적으로 적용되지 않았을 경우엔 정확히 어떤 CSS Selector가 문제인지도 같이 반환한다.
```

#### List_v2.ts & Document_v2.ts

```
기존 (List.ts/ Document.ts) 스크립트와 차이점은
직접 스크립트를 inject하여 크롤링하지 않고 page객체에 $, $$, $eval, $$eval API를 사용해서 크롤링 한다는 것.
이 방법은 기존 방법대비 유리한 점이 많은데
1. Log 찍기가 훨-씬 수월해짐.
2. addScriptTag API 호출시 간헐적으로 발생하는 예외를 차단할 수 있음. (아예 쓰지 않아도 되기 때문.)
3. ElementHandler를 반환해주기 때문에 입맛대로 요리할 수 있음.
4. 콜백함수에서 모든걸 해결하지 않아도 되니까 코드가 간결해지고 가독성 좋아짐!
```

---

## AWS-SDK

#### UploadUtil.ts

```
aws-sdk 모듈을 사용하여 파일(텍스트,이미지 등)을 S3에 업로드하는 로직.
이 또한 native promise를 지원해준다. 순차적 처리가 필요하다면 promise() 함수를 이용해서 then,catch 체인을 사용할수 있다!
추가로, S3말고도 SQS등 더 다양한 서비스에 대한 API도 있으니 필요 목적에 따라 찾아쓰면 되겠다!
```

> 참고 : <https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/sdk-code-samples.html>

---

## DotEnv

#### ReadEnvUtil.ts

```
데이터베이스/서버 주소,포트 등등의 민감한 비밀정보가 담긴
*.env*.* 파일을 읽어 환경변수로 세팅해주는 dotenv 모듈을 활용한 로직.
<** 주의 **> 위 방법으로 비밀파일을 관리할 땐 반드시 .gitignore에 리스트업 해줘야 한다!!!
```

---

## Winston / Winston-Daily-Rotate-File

#### LogUtil.ts

```
Winston 와 Winston-Daily-Rotate-File 모듈을 사용한 로깅 로직.
화면에 어떻게 로그를 출력할지, 어떻게 저장해서 어떻게 관리할지 등등을 설정을 통해 커스터마이징할 수 있다.
```

```
Error: EMFILE, too many open files 이슈
logger를 동적으로 할당할 때 \*.log 파일에 write 작업 후 해당 stream이 자동으로 close 되지 않아서 서버,수집기가 죽는 이슈가 있었다. 문제를 찾아보니 logger는 정적 인스턴스로 활용해야한다고 한다. 그래서 tatic으로 선언해버리니 깔끔하게 해결됐다.
```

---

## Forever

#### package.json

```
NodeJS 프로그램이 죽지 않게 백그라운드에서 작동시켜주는 모듈.
Package.json 안의 script에 리눅스명령어와 적절히 조합하여 사용하면 지극히 사소하지만 불필요한 노동을 줄일 수 있다.
```

> 참고 <https://www.npmjs.com/package/forever>

---

## PM2

#### package.json

```
NodeJS 프로그램이 죽지 않게 백그라운드에서 작동시켜주는 모듈.
forever 모듈과 비교하면 모니터링, 로드 밸런서 기능이 포함되어 있다는 점인데.
수백 개의 크롤러를 모니터링하면서 지쳐가던 때 이걸로 모니터링 시간을 꽤나 줄일 수 있을것 같아 과감히 forever 에서 pm2로 갈아타기로 했다!
마찬가지로 전역으로 설치해서 사용하며 tail 명령어로 실시간 로그를 확인할 땐 package.json에 스크립트로 작성해놓고 사용하면 편리하다!
```

> 참고 <https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/>

---
