import { Component, ViewChild } from "@angular/core";
import { DestinationService } from "src/app/services/destination.service";
import { DriverService } from "src/app/services/driver.service";
import { LicensePlateService } from "src/app/services/license-plate.service";
import { EntitySearchAndSelectComponent } from "../entity-search-and-select/entity-search-and-select.component";

@Component({
  selector: "app-settings-destination",
  templateUrl: "./settings-destination.component.html",
  styleUrls: ["./settings-destination.component.css"],
})
export class SettingsDestinationComponent {
  constructor(
    public licensePlateService: LicensePlateService,
    public destinationService: DestinationService,
    public driverService: DriverService
  ) {}
  lastSearchInput: string = "";
  newDestinationInput: string = "";
  updateDestinationNameInput: string = "";
  selectedDestinationEntity: any;
  updateDestinationUnknownCheckboxInput: boolean = false;

  @ViewChild("settingsdestinationdestinationSearchAndSelect")
  settingsdestinationdestinationSearchAndSelect!: EntitySearchAndSelectComponent;

  calculateClass() {
    if (this.selectedDestinationEntity) {
      return "edit-destination-block";
    } else {
      return "edit-destination-none";
    }
  }

  async addNewDestination() {
    let saveObject: any = {};
    saveObject.content = this.newDestinationInput.trim();
    saveObject.drivers = [];
    saveObject.unknown = false;
    saveObject.driversEverExistedWithThisDestination = [];
    await DestinationService.createEntity(saveObject);
    this.newDestinationInput = "";
    if (this.lastSearchInput !== "") {
      await DestinationService.filterEntries(this.lastSearchInput);
      this.settingsdestinationdestinationSearchAndSelect.setEntityArray(
        DestinationService.filteredDestinations
      );
    }
  }

  async filterForDestinations(searchTxt: string) {
    console.log("filterForDestinations");
    this.lastSearchInput = searchTxt;
    await DestinationService.filterEntries(searchTxt);
    this.settingsdestinationdestinationSearchAndSelect.setEntityArray(
      DestinationService.filteredDestinations
    );
    this.selectedDestinationEntity = undefined;
    this.updateDestinationNameInput = "";
  }
  async selectedDestination(destinationId: string) {
    const destination: any = DestinationService.destinationDocs.filter(
      (a: any) => {
        if (a._id === destinationId) {
          return a;
        }
      }
    )[0];
    if (destination) {
      this.selectedDestinationEntity = destination;
      this.updateDestinationNameInput = destination.content;
      this.updateDestinationUnknownCheckboxInput = destination.unknown;
    }
  }

  async editDestination(destinationEntity: any) {
    destinationEntity.content = this.updateDestinationNameInput.trim();
    destinationEntity.unknown = this.updateDestinationUnknownCheckboxInput;
    await DestinationService.updateEntity(destinationEntity, false);
    this.selectedDestinationEntity = undefined;
    this.updateDestinationNameInput = "";
    await DestinationService.filterEntries(this.lastSearchInput);
    this.settingsdestinationdestinationSearchAndSelect.setEntityArray(
      DestinationService.filteredDestinations
    );
  }
  async deleteDestination(destinationEntity: any) {
    let result = confirm("Biztosan törölni szeretnéd?");
    if (result === true) {
      await DestinationService.updateEntity(destinationEntity, true);
      this.selectedDestinationEntity = undefined;
      this.updateDestinationNameInput = "";
      await this.filterForDestinations(this.lastSearchInput);
      this.settingsdestinationdestinationSearchAndSelect.setEntityArray(
        DestinationService.filteredDestinations
      );
    }
  }
}
