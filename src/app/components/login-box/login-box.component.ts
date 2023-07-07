import { Component, EventEmitter, Output } from "@angular/core";
import { DBAuthService } from "src/app/services/dbauth.service";
import { DestinationService } from "src/app/services/destination.service";
import { DriverService } from "src/app/services/driver.service";
import { EntryService } from "src/app/services/entry.service";
import { LicensePlateService } from "src/app/services/license-plate.service";
import axios from "axios";
const PouchDB = require("pouchdb").default;

@Component({
  selector: "app-login-box",
  templateUrl: "./login-box.component.html",
  styleUrls: ["./login-box.component.css"],
})
export class LoginBoxComponent {
  @Output() loginResultEvent = new EventEmitter<boolean>();

  username: string = "";
  password: string = "";
  hostandport: string = "";

  loginAttempt: boolean = false;
  loginResult: boolean = true;
  replicationStarted: boolean = false;

  replications: any = [];

  async login() {
    this.loginResult = true;
    this.loginAttempt = true;
    let result = await this.dbAuthService.tryToConnectToDatabase(
      "https",
      this.username,
      this.password,
      this.hostandport,
      "auth"
    );
    this.loginResult = result;
    if (this.loginResult) {
      localStorage.setItem("app_username", this.username);
      localStorage.setItem("app_password", this.password);
      localStorage.setItem("app_hostandport", this.hostandport);
      this.replicationStarted = true;
      await this.startToReplicateDatabases(
        "https",
        this.username,
        this.password,
        this.hostandport,
        "destination"
      );
      await this.startToReplicateDatabases(
        "https",
        this.username,
        this.password,
        this.hostandport,
        "driver"
      );
      await this.startToReplicateDatabases(
        "https",
        this.username,
        this.password,
        this.hostandport,
        "license_plate"
      );
      await this.startToReplicateDatabases(
        "https",
        this.username,
        this.password,
        this.hostandport,
        "entry"
      );
    }
  }

  async startToReplicateDatabases(
    protocol: string,
    user: string,
    pw: string,
    hostAndPort: string,
    database: string
  ) {
    var Pouchdatabase = new PouchDB(database, { auto_compaction: true });
    Pouchdatabase.replicate
      .from(
        protocol + "://" + user + ":" + pw + "@" + hostAndPort + "/" + database,
        {
          batch_size: 10000,
        }
      )
      .on("complete", (info: any) => {
        this.replications.push(database);
        if (this.replications.length === 4) {
          window.location.reload();
          //this.loginResultEvent.emit(this.loginResult);
        }
        console.log("replication done");
        console.log(info);
      })
      .on("error", (err: any) => {
        console.log("Replication error");
        console.log(err);
      });
  }

  async cleanUpDeletedRows() {
    let result = confirm(
      "Mindegyik portán újra kell tölteni az alkalmazást mielőtt továbbmész..."
    );
    if (result === true) {
      let result2 = confirm("Biztosan újra lett tölteve mindegyik porta ?");
      if (result2 === true) {
        axios
          .get(
            "https://" +
              this.username +
              ":" +
              this.password +
              "@" +
              this.hostandport +
              "/" +
              "CLEANUP"
          )
          .then((response) => {
            alert(
              "Várj 5 percet amíg megtörténik a csoda és jelentkezz be újra"
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }

  async backupToLatestRevision() {
    let result = confirm(
      "Mindegyik portán újra kell tölteni az alkalmazást mielőtt továbbmész..."
    );
    if (result === true) {
      let result2 = confirm("Biztosan újra lett tölteve mindegyik porta ?");
      if (result2 === true) {
        axios
          .get(
            "https://" +
              this.username +
              ":" +
              this.password +
              "@" +
              this.hostandport +
              "/" +
              "BACKUP"
          )
          .then((response) => {
            alert(
              "Várj 10 percet amíg megtörténik a csoda és jelentkezz be újra"
            );
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  }

  constructor(private dbAuthService: DBAuthService) {}
}
