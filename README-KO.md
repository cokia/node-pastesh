# node-pastesh

간단하고 빠른 pastebin 서비스인 paste.sh를 위한 Node.js 클라이언트입니다. 
이 클라이언트를 사용하면 Node.js 애플리케이션에서 paste.sh에 암호화된 텍스트를 업로드할 수 있습니다.

## 설치

npm이나 yarn을 통해 `node-pastesh` 패키지를 설치할 수 있습니다

```sh
npm install node-pastesh
```

```sh
yarn add node-pastesh
```


## 사용법

### 모듈 가져오기

ES6 import 구문을 사용하여 `node-pastesh` 모듈을 가져올 수 있습니다:

```typescript
import pastesh from 'node-pastesh';
```

또는 CommonJS require를 사용하여 가져올 수도 있습니다:

```javascript
const pastesh = require('node-pastesh');
```

### 붙여넣기 생성

붙여넣기를 생성하려면 업로드할 텍스트와 함께 `create` 메서드를 호출하여 생성할 수 있습니다. 이 메서드는 생성된 붙여넣기의 URL로 해결되는 프라미스를 반환합니다.

#### ES6 예제

```typescript
import pastesh from 'node-pastesh';

(async () => {
  try {
    const message = 'This is the body of the paste.';
    const url = await pastesh.create(message);
    console.log(`Paste created successfully: ${url}`);
  } catch (error) {
    console.error(`Failed to create paste: ${error.message}`);
  }
})();
```

#### CommonJS 예제

```javascript
const pastesh = require('node-pastesh');

(async () => {
  try {
    const message = 'This is the body of the paste.';
    const url = await pastesh.create(message);
    console.log(`Paste created successfully: ${url}`);
  } catch (error) {
    console.error(`Failed to create paste: ${error.message}`);
  }
})();
```

### 커스텀 Paste.sh 서버에 대한 대응

기본적으로 붙여넣기는 `https://paste.sh`에 업로드됩니다. 사용자 정의 API 엔드포인트를 사용하려면 `create` 메서드의 두 번째 인수로 전달할 수 있습니다.

```typescript
const customEndpoint = 'https://custom-paste.sh';
const url = await pastesh.create(message, customEndpoint);
console.log(`Paste created successfully: ${url}`);
```

## API

### `pastesh.create(message: string, apiEndpoint?: string): Promise<string>`

주어진 메시지로 새로운 붙여넣기를 생성합니다.

- `message` (string): 붙여넣을 내용.
- `apiEndpoint` (string, optional): 붙여넣기를 업로드할 API 엔드포인트. 기본값은 `https://paste.sh`.

생성된 붙여넣기의 URL로 해결되는 프라미스를 반환합니다.

## 기여

openssh 명령을 호출하는 형태를 벗어나서, nodejs 기본 Crypto 패키지만을 사용해 구현하는 작업을 진행중에 있습니다.
이러한 작업을 도와주실 수 있는 분이라면, 언제든지 Issue나 Pull Request 를 남겨주시면 감사드리겠습니다. 

## 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 글

이 패키지는 David Leadbeater의 오리지널 `paste.sh` 클라이언트에서 영감을 받았습니다.