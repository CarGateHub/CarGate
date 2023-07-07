import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { EntryService } from "src/app/services/entry.service";

@Component({
  selector: "app-entrytable",
  templateUrl: "./entrytable.component.html",
  styleUrls: ["./entrytable.component.css"],
})
export class EntrytableComponent {
  @Input() entriesArray: any = [];
  @Input() readyToUse: boolean = false;

  @Output() quickSelectEntryEvent = new EventEmitter<any>();
  @Output() editEntryEvent = new EventEmitter<any>();

  converToDate(dateAsNumber: number) {
    let convertedDate = new Date(dateAsNumber);
    let ret = convertedDate.toLocaleString();
    ret = ret.replace("T", " ");
    return ret;
  }

  getLicensePlateContent(license_plate: any) {
    console.log("getLicensePlateContent", license_plate);
    if (typeof license_plate === "string") {
      return license_plate;
    } else {
      return license_plate.content;
    }
  }

  driverClassCalculator(driver: any) {
    let ret: string = "";

    if (typeof driver === "string") {
      ret += " entity_unknown ";
    }

    if (driver.valid) {
      ret += " entity_valid ";
    }

    if (driver.banned) {
      ret += " entity_banned ";
    }
    return ret;
  }

  clearEntriesArray() {
    this.entriesArray = [];
  }

  setEntriesArray(entriesArrayParam: any) {
    this.entriesArray = entriesArrayParam;
  }

  doubleClick(entry: any) {
    console.log("double click");
    this.quickSelectEntryEvent.emit(entry);
  }

  editEntry(entry: any) {
    this.editEntryEvent.emit(entry);
  }

  deleteEntry(entry: any) {
    let result = confirm("Biztosan törölni szeretnéd?");
    if (result === true) {
      EntryService.updateEntity(entry, true);
    }
  }

  ngOnInit() {}
}

/*

*/
