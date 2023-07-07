import { Component } from "@angular/core";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"],
})
export class SettingsComponent {
  clearMemory() {
    let result = confirm(
      "Biztosan újra szeretnéd tölteni az alkalmazást? TUDOD A JELSZÓT ??"
    );
    if (result === true) {
      window.localStorage.clear();
      const Databases_promise = window.indexedDB.databases();
      Databases_promise.then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
          }
        });
      });

      const DBDeleteRequest_pouch_driver =
        window.indexedDB.deleteDatabase("_pouch_driver");
      DBDeleteRequest_pouch_driver.onsuccess = (event: any) => {
        const DBDeleteRequest_pouch_entry =
          window.indexedDB.deleteDatabase("_pouch_entry");
        DBDeleteRequest_pouch_entry.onsuccess = (event: any) => {
          const DBDeleteRequest_pouch_license_plate =
            window.indexedDB.deleteDatabase("_pouch_license_plate");
          DBDeleteRequest_pouch_license_plate.onsuccess = (event: any) => {
            const DBDeleteRequest_pouch_destination =
              window.indexedDB.deleteDatabase("_pouch_destination");
            DBDeleteRequest_pouch_destination.onsuccess = (event: any) => {
              window.location.reload();
            };
          };
        };
      };
    }
  }
}
