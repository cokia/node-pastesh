import * as crypto from "crypto";
import axios from "axios";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { execSync } from "child_process";

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

  private static encryptMessageOpenSSL(
    message: string,
    id: string,
    serverKey: string,
    clientKey: string
  ): string {
    const key = Pastesh.writeKey(id, serverKey, clientKey);
    const keyHash = crypto
      .createHash("sha512")
      .update(key)
      .digest()
      .slice(0, 32);

    const tmpPlainFilePath = path.join(os.tmpdir(), `plain_${id}.txt`);
    const tmpEncFilePath = path.join(os.tmpdir(), `enc_${id}.txt`);

    fs.writeFileSync(tmpPlainFilePath, message);

    execSync(
      `openssl enc -aes-256-cbc -md sha512 -pass pass:${key} -iter 1 -base64 -in ${tmpPlainFilePath} -out ${tmpEncFilePath}`
    );

    const encryptedMessage = fs.readFileSync(tmpEncFilePath, "utf8");

    fs.unlinkSync(tmpPlainFilePath);
    fs.unlinkSync(tmpEncFilePath);

    return encryptedMessage;
  }

  public static async create(
    message: string,
    apiEndpoint: string = "https://paste.sh"
  ): Promise<string> {
    const serverKey = Pastesh.randBase64(18);
    const id = Pastesh.randBase64(6);
    const clientKey = Pastesh.randBase64(18);

    const encryptedMessage = Pastesh.encryptMessageOpenSSL(
      message,
      id,
      serverKey,
      clientKey
    );

    const tmpFilePath = path.join(os.tmpdir(), `paste_${id}.txt`);
    fs.writeFileSync(tmpFilePath, encryptedMessage);

    try {
      const response = await axios({
        method: "put",
        url: `${apiEndpoint}/${id}`,
        headers: {
          "X-Server-Key": serverKey,
          "Content-Type": "text/vnd.paste.sh-v3",
        },
        data: fs.createReadStream(tmpFilePath),
      });

      if (response.status === 200) {
        return `${apiEndpoint}/${id}#${clientKey}`;
      } else {
        throw new Error("Failed to upload the paste");
      }
    } catch (error: any) {
      throw new Error(`Error uploading the paste: ${error.message}`);
    } finally {
      fs.unlinkSync(tmpFilePath);
    }
  }
}

export default Pastesh;
