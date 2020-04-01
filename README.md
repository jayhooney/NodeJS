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
따라서 이 모듈을 사용할 땐 내가 필요한 옵션이 무엇인지 https://www.npmjs.com/package/cors 이 링크를 통해 확인 후 적절하게 진행해야 한다!
```

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

#### FilUtil.ts

```
기본적으로 비동기로 작동하는 파일 존재 유무,쓰기,읽기 그리고 지우기 작업을
Promise를 반환받아 처리결과를 보장받고 다음 작업을 진행하도록 구현한 로직
좀 더 일찍 알았다면 좋았을텐데, 모듈 내부를 뜯어보고 나서인 최근에야 알게됐다...
```

---

## Puppeteer

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

---

## AWS-SDK

#### UploadUtil.ts

```
aws-sdk 모듈을 사용하여 파일(텍스트,이미지 등)을 S3에 업로드하는 로직.
이 또한 native promise를 지원해준다. 순차적 처리가 필요하다면 promise() 함수를 이용해서 then,catch 체인을 사용할수 있다!
추가로, S3말고도 SQS등 더 다양한 서비스에 대한 API도 있으니 필요 목적에 따라 찾아쓰면 되겠다!
```

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

---

## Forever

#### package.json

```
NodeJS 프로그램이 죽지 않도록 백그라운드에서 작동하도록 해주는 모듈.
Package.json 안의 script에 리눅스명령어와 적절히 조합하여 사용하면 지극히 사소하지만 불필요한 노동을 줄일 수 있다.
전역모듈로 설치하는게 편하다.
```

---
