import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-entity-search-and-select",
  templateUrl: "./entity-search-and-select.component.html",
  styleUrls: ["./entity-search-and-select.component.css"],
})
export class EntitySearchAndSelectComponent {
  entityArray: any[] = [];
  @Input() entityContentName: string = "";
  @Input() entityName: string = "";
  @Input() placeholderContent: string = "";

  @Input() unknownHandling: boolean = true;
  @Input() withoutSearch: boolean = false;

  @Output() searchEntityEvent = new EventEmitter<string>();
  @Output() selectedEntityEvent = new EventEmitter<string>();

  searchTxt: string = "";
  timeout: any = null;
  selectedEntry: any;
  unknownEntity: any;

  triggerSearch() {
    clearTimeout(this.timeout);
    this.clearSelectedEntry();
    this.timeout = setTimeout(async () => {
      if (this.selectedEntry) {
        this.selectedEntry.selected = false;
      }
      this.searchEntityEvent.emit(this.searchTxt);
    }, 1000);
  }

  clearSelectionForNormalEntity() {
    if (this.selectedEntry !== undefined) {
      this.selectedEntry.selected = false;
    }
    this.selectedEntry = undefined;
    this.unknownEntity = undefined;
  }

  clearSelectedEntry() {
    this.clearSelectionForNormalEntity();
    this.entityArray = [];
    this.clearTableContent();
  }

  clearSearchText() {
    this.searchTxt = "";
  }

  addUnknownRow() {
    if (this.searchTxt.length > 0 && this.unknownHandling) {
      const newRow = document.createElement("tr");
      newRow.setAttribute("class", "entity_table_row");

      const cell = document.createElement("td");
      cell.onclick = () => {
        this.selectUnknownEntry(this.searchTxt);
      };
      cell.textContent = "Ism: " + this.searchTxt;

      if (this.unknownEntity) {
        cell.setAttribute(
          "class",
          "entity_table_cell unknown_table_cell entity_table_cell_selected"
        );
      } else {
        cell.setAttribute("class", "entity_table_cell unknown_table_cell");
      }

      cell.setAttribute("id", "unknown");

      newRow.appendChild(cell);
      document!
        .querySelector("#" + this.entityName + "_entity_tbody")!
        .appendChild(newRow);
    }
  }

  addRow(entry: any) {
    // Step 2: Create a new row element and data cells
    const newRow = document.createElement("tr");
    newRow.setAttribute("class", "entity_table_row");

    const cell = document.createElement("td");
    cell.onclick = () => {
      this.selectEntry(entry);
    };

    cell.textContent = entry.content;

    cell.setAttribute(
      "class",
      "entity_table_cell " + this.determineClasses(entry)
    );
    cell.setAttribute("id", entry._id);

    newRow.appendChild(cell);
    document!
      .querySelector("#" + this.entityName + "_entity_tbody")!
      .appendChild(newRow);
  }

  clearTableContent() {
    document!.querySelector(
      "#" + this.entityName + "_entity_tbody"
    )!.innerHTML = "";
  }

  drawTable() {
    console.log(this.entityArray);
    this.clearTableContent();
    this.entityArray.forEach((entity) => {
      this.addRow(entity);
    });
    this.addUnknownRow();
  }

  setEntityArray(entityArrayParam: any[]) {
    this.entityArray = entityArrayParam;

    this.drawTable();
  }

  selectEntry(entry: any) {
    this.unknownEntity = undefined;
    if (this.selectedEntry === undefined) {
      entry.selected = true;
      this.selectedEntry = entry;
    } else {
      this.selectedEntry.selected = false;
      entry.selected = true;
      this.selectedEntry = entry;
    }
    this.drawTable();
    this.selectedEntityEvent.emit(this.selectedEntry._id);
  }

  selectUnknownEntry(unknownEntity: string) {
    this.clearSelectionForNormalEntity();
    this.unknownEntity = unknownEntity;
    this.drawTable();
    this.selectedEntityEvent.emit(this.unknownEntity);
  }

  determineClasses(entity: any) {
    let ret: string = "";
    if (entity.selected) {
      ret += "entity_table_cell_selected ";
    }
    if (entity.banned) {
      ret += " entity_banned ";
    }
    if (entity.valid) {
      ret += " entity_valid ";
    }
    if (entity.unknown) {
      ret += " entity_unknown ";
    }
    return ret;
  }
}
