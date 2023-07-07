import { Component, EventEmitter, Output } from "@angular/core";
import { EntryService } from "src/app/services/entry.service";

@Component({
  selector: "app-entry-table-native",
  templateUrl: "./entry-table-native.component.html",
  styleUrls: ["./entry-table-native.component.css"],
})
export class EntryTableNativeComponent {
  entriesArray: any = [];

  @Output() quickSelectEntryEvent = new EventEmitter<any>();
  @Output() editEntryEvent = new EventEmitter<any>();

  converToDate(dateAsNumber: number) {
    let convertedDate = new Date(dateAsNumber);
    let ret = convertedDate.toLocaleString();
    ret = ret.replace("T", " ");
    return ret;
  }

  addRow(entry: any) {
    // Step 2: Create a new row element and data cells
    const newRow = document.createElement("tr");
    newRow.setAttribute("class", "table_row");
    newRow.ondblclick = () => {
      this.doubleClick(entry);
    };

    const licensePlateCell = document.createElement("td");
    if (typeof entry.license_plate === "string") {
      licensePlateCell.textContent = entry.license_plate;
    } else {
      licensePlateCell.textContent = entry.license_plate.content;
    }
    licensePlateCell.setAttribute(
      "class",
      this.licensePlateClassCalculator(entry.license_plate)
    );

    const driverNameCell = document.createElement("td");
    if (typeof entry.driver === "string") {
      driverNameCell.textContent = entry.driver;
    } else {
      driverNameCell.textContent = entry.driver.content;
    }
    driverNameCell.setAttribute(
      "class",
      this.driverClassCalculator(entry.driver)
    );

    const destinationCell = document.createElement("td");
    if (typeof entry.destination === "string") {
      destinationCell.textContent = entry.destination;
    } else {
      destinationCell.textContent = entry.destination.content;
    }
    destinationCell.setAttribute(
      "class",
      this.destinationClassCalculator(entry.destination)
    );

    const dateCell = document.createElement("td");
    dateCell.textContent = this.converToDate(entry.time);

    const directionCell = document.createElement("td");
    directionCell.textContent = entry.direction;

    const placeCell = document.createElement("td");
    placeCell.textContent = entry.porta;

    const commentCell = document.createElement("td");
    commentCell.textContent = entry.comment;

    const buttonCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.textContent = "🔧";
    editButton.setAttribute("class", "button_in_table");
    editButton.onclick = () => {
      this.editEntry(entry);
    };

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.setAttribute("class", "button_in_table");
    deleteButton.onclick = () => {
      this.deleteEntry(entry);
    };

    buttonCell.appendChild(editButton);
    buttonCell.appendChild(deleteButton);

    // Step 3: Append the new row to the table
    newRow.appendChild(licensePlateCell);
    newRow.appendChild(driverNameCell);
    newRow.appendChild(destinationCell);
    newRow.appendChild(dateCell);
    newRow.appendChild(directionCell);
    newRow.appendChild(placeCell);
    newRow.appendChild(commentCell);
    newRow.appendChild(buttonCell);
    document!.querySelector("#entryTableBody")!.appendChild(newRow);
  }

  clearTableContent() {
    document!.querySelector("#entryTableBody")!.innerHTML = "";
  }

  destinationClassCalculator(destination: any) {
    let ret: string = "";

    if (typeof destination === "string") {
      ret += " entity_unknown ";
    }

    return ret;
  }

  licensePlateClassCalculator(license_plate: any) {
    let ret: string = "";
    if (typeof license_plate === "string") {
      ret += " entity_unknown ";
    }

    return ret;
  }

  driverClassCalculator(driver: any) {
    let ret: string = "";

    if (driver.valid) {
      ret += " entity_valid ";
    }

    if (driver.banned) {
      ret += " entity_banned ";
    }

    if (typeof driver === "string") {
      ret += " entity_unknown ";
    }
    return ret;
  }

  clearEntriesArray() {
    this.entriesArray = [];
  }

  setEntriesArray(entriesArrayParam: any) {
    console.log(entriesArrayParam);
    this.entriesArray = entriesArrayParam;
    this.clearTableContent();
    this.entriesArray.forEach((element: any) => {
      this.addRow(element);
    });
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
