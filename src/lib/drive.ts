import { google } from "googleapis";
import { readFileSync } from "fs";

const keyFileContents = readFileSync("./google-drive-key.json", "utf8");
const credentials = JSON.parse(keyFileContents);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export { drive };
