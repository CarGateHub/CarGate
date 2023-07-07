import { Component, EventEmitter, Output } from "@angular/core";
import { EntryService } from "src/app/services/entry.service";

@Component({
  selector: "app-update-entry-popup",
  templateUrl: "./update-entry-popup.component.html",
  styleUrls: ["./update-entry-popup.component.css"],
})
export class UpdateEntryPopupComponent {
  currentEntry: any = undefined;
  @Output() updateEntryEntityResultEvent = new EventEmitter<boolean>();
  entryDateTime: string = "";
  update_entry_comment: string = "";

  constructor() {}

  setEntryEntity(entry: any) {
    this.currentEntry = entry;

    var dateToGetRealTime = new Date(0);
    dateToGetRealTime.setUTCSeconds(this.currentEntry.time / 1000);
    console.log(this.currentEntry.time);
    console.log(dateToGetRealTime);
    let year, month, day, hour, minute, sec;
    year = dateToGetRealTime.getFullYear();
    month = dateToGetRealTime.getMonth() + 1;
    if (month < 10) {
      month = "0" + month.toString();
    }
    day = dateToGetRealTime.getDate();
    if (day < 10) {
      day = "0" + day.toString();
    }
    hour = dateToGetRealTime.getHours();
    if (hour < 10) {
      hour = "0" + hour.toString();
    }
    minute = dateToGetRealTime.getMinutes();
    if (minute < 10) {
      minute = "0" + minute.toString();
    }
    sec = dateToGetRealTime.getSeconds();
    if (sec < 10) {
      sec = "0" + sec.toString();
    }
    console.log(
      year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + sec
    );
    this.entryDateTime =
      year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + sec;
    this.update_entry_comment = entry.comment;
  }

  saveChanges() {
    console.log("saveChanges");

    this.currentEntry.time = new Date(this.entryDateTime).getTime();
    var dateToGetRealTime = new Date(0);
    dateToGetRealTime.setUTCSeconds(this.currentEntry.time / 1000);

    this.currentEntry.time = new Date(dateToGetRealTime).getTime();
    console.log(this.currentEntry.time);
    this.currentEntry.comment = this.update_entry_comment;
    this.currentEntry.license_plate = this.currentEntry.license_plate._id;
    this.currentEntry.driver = this.currentEntry.driver._id;
    this.currentEntry.destination = this.currentEntry.destination._id;
    EntryService.updateEntity(this.currentEntry, false);
    this.updateEntryEntityResultEvent.emit(true);
  }

  cancelChanges() {
    this.updateEntryEntityResultEvent.emit(false);
  }
}
