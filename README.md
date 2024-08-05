# node-pastesh

[한국어 버전 설명은 위 파일을 참고해주세요](README-KO.md)

A Node.js client for paste.sh, a simple and fast pastebin service. This client allows you to upload encrypted text to paste.sh from your Node.js applications.

## Installation

You can install the `node-pastesh` package via npm or yarn:

```sh
npm install node-pastesh
```

```sh
yarn add node-pastesh
```

## Usage

### Importing the Module

You can import the `node-pastesh` module using ES6 import syntax:

```typescript
import pastesh from 'node-pastesh';
```

Or using CommonJS require:

```javascript
const pastesh = require('node-pastesh');
```

### Creating a Paste

To create a paste, call the `create` method with the text you want to upload. This method returns a promise that resolves with the URL of the created paste.

#### ES6 Example

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

#### CommonJS Example

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

### Custom Paste.sh Server

By default, the paste will be uploaded to `https://paste.sh`. If you want to use a custom API endpoint, you can pass it as the second argument to the `create` method.

```typescript
const customEndpoint = 'https://custom-paste.sh';
const title = 'My Custom Paste';
const message = 'This is the body of the paste.';
const url = await pastesh.create(message, title, customEndpoint);
console.log(`Paste created successfully: ${url}`);
```

## API

### `pastesh.create(message: string, apiEndpoint?: string, subject?: string): Promise<string>`

Creates a new paste with the given message.

- `message` (string): The content to be pasted.
- `apiEndpoint` (string, optional): The API endpoint to upload the paste. Defaults to `https://paste.sh`.
- `subject` (string, optional): The Title to be uploaded contents.

Returns a promise that resolves to the URL of the created paste.

## Contributing
please feel free to open an issue or submit a pull request. 

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

This package is inspired by the original `paste.sh` client by David Leadbeater.