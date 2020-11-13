# Puppeteer 를 CLI 환경에서 사용할 때

## UBUNTU 18.04 - 1. FAIL LAUNCH CHROME 이슈

```
HEADLESS BROWSER 임에도 불구하고 CLI 환경에서 크로미움을 런치하지 못할 때가 있다.
원인은 크롬을 런치하기 위한 라이브러리들이 OS에 설치되지 않았기 때문이며 아래 명령어를 통해 해결할 수 있다.

sudo apt-get upgrade -y

sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm-dev libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

위 명령어대로 라이브러리들을 설치 후
브라우저 런치 옵션 args에 '--no-sandbox', '--disable-setuid-sandbox' 를 추가해주면 잘 된다!

```

> 참고 : <https://skyksit.tistory.com/entry/%EC%9A%B0%EB%B6%84%ED%88%ACUbuntu-puppeteer-%EC%8B%A4%ED%96%89%EC%8B%9C-%EC%97%90%EB%9F%AC%EB%82%A0%EB%95%8C-libX11-xcbso>  
> 참고 : <https://velog.io/@shelly/ubuntu%EC%97%90%EC%84%9C-puppeteer-%EC%8B%A4%ED%96%89-%EC%98%A4%EB%A5%98>
