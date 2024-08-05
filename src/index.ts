import * as crypto from "crypto";
import axios from "axios";
import * as CryptoJS from "crypto-js";

class Pastesh {
  private static randBase64(bytes: number): string {
    return crypto
      .randomBytes(bytes)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  private static writeKey(
    id: string,
    serverKey: string,
    clientKey: string
  ): string {
    return `${id}${serverKey}${clientKey}https://paste.sh`;
  }

  private static deriveKeyAndIV(
    password: string,
    keySize: number,
    ivSize: number,
    salt: CryptoJS.lib.WordArray
  ) {
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: (keySize + ivSize) / 32,
      iterations: 1,
      hasher: CryptoJS.algo.SHA512,
    });

    const iv = CryptoJS.lib.WordArray.create(
      key.words.slice(keySize / 32),
      ivSize / 8
    );

    key.sigBytes = keySize / 8;

    return { key, iv };
  }

  private static encryptMessageCryptoJS(
    message: string,
    id: string,
    serverKey: string,
    clientKey: string,
    version: number = 3,
    subject: string = ""
  ): { ciphertext: string; auth: string } {
    const key = Pastesh.writeKey(id, serverKey, clientKey);

    if (version === 3) {
      if (subject) {
        message = "Subject: " + subject.replace(/\n/g, "") + "\n\n" + message;
      }
    }

    const salt = CryptoJS.lib.WordArray.random(8);
    const { key: derivedKey, iv } = Pastesh.deriveKeyAndIV(key, 256, 128, salt);
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(message),
      derivedKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    const combinedData = CryptoJS.lib.WordArray.create(
      [0x53616c74, 0x65645f5f] // "Salted__"
        .concat(salt.words)
        .concat(encrypted.ciphertext.words)
    );

    const ciphertext = CryptoJS.enc.Base64.stringify(combinedData);
    const hmacInner = CryptoJS.HmacSHA512(key, "auth key");
    const hmac = CryptoJS.HmacSHA512(combinedData, hmacInner)
      .toString(CryptoJS.enc.Base64)
      .replace(/=+$/, "");

    return {
      ciphertext: ciphertext,
      auth: hmac,
    };
  }

  private static decryptMessageCryptoJS(
    ciphertext: string,
    id: string,
    serverKey: string,
    clientKey: string,
    auth: string
  ): string {
    const key = Pastesh.writeKey(id, serverKey, clientKey);

    // Parse the combined data
    const combinedData = CryptoJS.enc.Base64.parse(ciphertext);
    const calculatedHmac = CryptoJS.HmacSHA512(
      combinedData,
      CryptoJS.HmacSHA512(key, "auth key")
    )
      .toString(CryptoJS.enc.Base64)
      .replace(/=+$/, "");

    if (calculatedHmac !== auth) {
      throw new Error("Invalid authentication tag");
    }

    const words = combinedData.words;
    const salt = CryptoJS.lib.WordArray.create(words.slice(2, 4));
    const encrypted = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.lib.WordArray.create(words.slice(4)),
    });

    const { key: derivedKey, iv } = Pastesh.deriveKeyAndIV(key, 256, 128, salt);

    const decrypted = CryptoJS.AES.decrypt(encrypted, derivedKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return CryptoJS.enc.Utf8.stringify(decrypted);
  }

  public static async create(
    message: string,
    subject: string = "",
    apiEndpoint: string = "https://paste.sh"
  ): Promise<string> {
    const serverKey = Pastesh.randBase64(18);
    const id = Pastesh.randBase64(6);
    const clientKey = Pastesh.randBase64(18);

    const { ciphertext, auth } = Pastesh.encryptMessageCryptoJS(
      message,
      id,
      serverKey,
      clientKey,
      3,
      subject
    );

    try {
      const response = await axios({
        method: "put",
        url: `${apiEndpoint}/${id}`,
        headers: {
          "X-Server-Key": serverKey,
          "Content-Type": "text/vnd.paste.sh-v3",
          ETag: `"${auth}"`,
        },
        data: ciphertext,
      });

      if (response.status === 200) {
        return `${apiEndpoint}/${id}#${clientKey}`;
      } else {
        throw new Error("Failed to upload the paste");
      }
    } catch (error: any) {
      throw new Error(`Error uploading the paste: ${error.message}`);
    }
  }

  private static testEncryption() {
    const serverKey = Pastesh.randBase64(18);
    const id = Pastesh.randBase64(6);
    const clientKey = Pastesh.randBase64(18);
    const message = "나는 유리를 먹을 수 있어요. 그래도 아프지 않아요";
    const subject = "TEST";

    const { ciphertext, auth } = Pastesh.encryptMessageCryptoJS(
      message,
      id,
      serverKey,
      clientKey,
      3,
      subject
    );

    console.log("Ciphertext:", ciphertext);
    console.log("Auth tag:", auth);

    const decryptedMessage = Pastesh.decryptMessageCryptoJS(
      ciphertext,
      id,
      serverKey,
      clientKey,
      auth
    );
    const payload = `Subject: ${subject}\n\n${message}`;
    console.log("Original Message:", payload);
    console.log("Decrypted Message:", decryptedMessage);
    console.assert(payload === decryptedMessage, "Encryption test failed!");
  }
}

// Run the unit test
// Pastesh.testEncryption();

export default Pastesh;
