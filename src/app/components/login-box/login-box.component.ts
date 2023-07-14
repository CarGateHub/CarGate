import { Component, EventEmitter, Output } from "@angular/core";
import { DBAuthService } from "src/app/services/dbauth.service";
import { DestinationService } from "src/app/services/destination.service";
import { DriverService } from "src/app/services/driver.service";
import { EntryService } from "src/app/services/entry.service";
import { LicensePlateService } from "src/app/services/license-plate.service";
import axios from "axios";
import { MessageSenderService } from "src/app/services/message-sender.service";
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

  error_count = 0;
  try_count = 0;
  loginAttempt: boolean = false;
  loginResult: boolean = true;
  replicationStarted: boolean = false;

  replications: any = [];

  async login() {
    this.loginResult = true;
    this.loginAttempt = true;
    if (this.username.trim() === "") {
      alert("hiányzik a felhasználónév");
      return;
    }
    if (this.password.trim() === "") {
      alert("hiányzik a jelszó");
      return;
    }
    if (this.hostandport.trim() === "") {
      alert("Hiányzik a szerver elérhetősége");
      return;
    }

    let result = await this.dbAuthService.tryToConnectToDatabase(
      "https",
      this.username.trim(),
      this.password.trim(),
      this.hostandport.trim(),
      "auth"
    );
    this.loginResult = result;
    if (this.loginResult) {
      localStorage.setItem("app_username", this.username.trim());
      localStorage.setItem("app_password", this.password.trim());
      localStorage.setItem("app_hostandport", this.hostandport.trim());
      this.replicationStarted = true;
      await this.startToReplicateDatabases(
        "https",
        this.username.trim(),
        this.password.trim(),
        this.hostandport.trim(),
        "destination"
      );
      await this.startToReplicateDatabases(
        "https",
        this.username.trim(),
        this.password.trim(),
        this.hostandport.trim(),
        "driver"
      );
      await this.startToReplicateDatabases(
        "https",
        this.username.trim(),
        this.password.trim(),
        this.hostandport.trim(),
        "license_plate"
      );
      await this.startToReplicateDatabases(
        "https",
        this.username.trim(),
        this.password.trim(),
        this.hostandport.trim(),
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
        this.try_count++;
        if (this.try_count == 4) {
          this.checkErrors();
        }
        if (this.replications.length === 4) {
          this.messageSenderService.SendMessage("Sikeres bejelentkezés");
          window.location.reload();
          //this.loginResultEvent.emit(this.loginResult);
        }
        console.log("replication done");
        console.log(info);
      })
      .on("error", (err: any) => {
        this.error_count++;
        this.try_count++;
        if (this.try_count == 4) {
          this.checkErrors();
        }
        console.log("Replication error");
        console.log(err);
      });
  }

  checkErrors() {
    if (this.error_count > 0) {
      this.messageSenderService.SendMessage("Replication error");
      alert("Próbáld meg újra, Hiba történt az adatbázis betöltésekor.");
      window.localStorage.clear();
      window.location.reload();
    }
  }

  async cleanUpDeletedRows() {
    let result = confirm(
      "Mindegyik portán újra kell tölteni az alkalmazást mielőtt továbbmész..."
    );
    if (result === true) {
      let result2 = confirm("Biztosan újra lett tölteve mindegyik porta ?");
      if (result2 === true) {
        if (this.username.trim() === "") {
          alert("hiányzik a felhasználónév");
          return;
        }
        if (this.password.trim() === "") {
          alert("hiányzik a jelszó");
          return;
        }
        if (this.hostandport.trim() === "") {
          alert("Hiányzik a szerver elérhetősége");
          return;
        }
        this.messageSenderService.SendMessage("cleanUpDeletedRows was called");
        axios
          .get("https://" + this.hostandport.trim() + "/" + "CLEANUP", {
            headers: {
              Authorization: btoa(
                this.username.trim() + ":" + this.password.trim()
              ),
            },
          })
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
        if (this.username.trim() === "") {
          alert("hiányzik a felhasználónév");
          return;
        }
        if (this.password.trim() === "") {
          alert("hiányzik a jelszó");
          return;
        }
        if (this.hostandport.trim() === "") {
          alert("Hiányzik a szerver elérhetősége");
          return;
        }
        axios
          .get(
            "https://" +
              this.username.trim() +
              ":" +
              this.password.trim() +
              "@" +
              this.hostandport.trim() +
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

  constructor(
    private dbAuthService: DBAuthService,
    public messageSenderService: MessageSenderService
  ) {}
}
