NodeJS 개발을 진행하며 남기는 기록
=================================
## 1. ESLint
*********************************
## 2. Prettier
*********************************
## 3. Express
#### 3-1. Server.ts
```
기본적인 HTTP 서버 생성
CORS 이슈 처리
```
#### Server.ts / RouterMap.ts 
```
라우팅해야할 것이 너무 많다면..?
Map과 forEach 함수로 깔끔하게 라우팅!
```
#### 3-3. Process.ts
```
Request객체의 Header에서 필요한 정보를 가져와 패킷을 인증하는 간단 로직
```
*********************************
## 4. FS-Extra
#### 4-1. FilUtil.ts
 ```
 기본적으로 비동기로 작동하는 파일 존재 유무,쓰기,읽기 그리고 지우기 작업을
 Promise를 반환받아 처리결과를 보장받고 다음 작업을 진행하도록 구현한 로직
 ```
*********************************
## 5. Promise
*********************************
## 6. Puppeteer 
*********************************
## 7. AWS-SDK
*********************************
## 8. DotEnv
#### 8-1. ReadEnvUtil.ts
```
데이터베이스/서버 주소,포트 등등의 민감한 비밀정보가 담긴
*.env*.* 파일을 읽어 환경변수로 세팅해주는 dotenv 모듈을 활용한 로직.
<** 주의 **> 위 방법으로 비밀파일을 관리할 땐 반드시 .gitignore에 리스트업 해줘야 한다!!! 
```
*********************************
