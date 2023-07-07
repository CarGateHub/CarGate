import { Injectable } from "@angular/core";
const PouchDB = require("pouchdb").default;

@Injectable({
  providedIn: "root",
})
export class DBAuthService {
  constructor() {}

  async tryToConnectToDatabase(
    protocol: string,
    user: string,
    pw: string,
    hostAndPort: string,
    database: string
  ) {
    let db = PouchDB(
      protocol + "://" + user + ":" + pw + "@" + hostAndPort + "/" + database
    );
    var ret = true;
    try {
      await new Promise(async (resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("timeout"));
        }, 10000); // wait 10 sec
        let doc = await db.allDocs({ include_docs: true });
        clearTimeout(timeoutId);
        resolve(true);
      });
    } catch (err) {
      ret = false;
      console.log(err);
    }
    return ret;
  }
}
