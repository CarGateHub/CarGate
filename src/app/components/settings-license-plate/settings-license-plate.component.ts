import { Component, ViewChild } from "@angular/core";
import { DestinationService } from "src/app/services/destination.service";
import { DriverService } from "src/app/services/driver.service";
import { LicensePlateService } from "src/app/services/license-plate.service";
import { EntitySearchAndSelectComponent } from "../entity-search-and-select/entity-search-and-select.component";

@Component({
  selector: "app-settings-license-plate",
  templateUrl: "./settings-license-plate.component.html",
  styleUrls: ["./settings-license-plate.component.css"],
})
export class SettingsLicensePlateComponent {
  constructor(
    public licensePlateService: LicensePlateService,
    public destinationService: DestinationService,
    public driverService: DriverService
  ) {}

  @ViewChild("settingslicensePlatelicensePlateSearchAndSelect")
  settingslicensePlatelicensePlateSearchAndSelect!: EntitySearchAndSelectComponent;

  @ViewChild(
    "settingslicensePlatedriversForTheSelectedLicensePlateSearchAndSelect"
  )
  settingslicensePlatedriversForTheSelectedLicensePlateSearchAndSelect!: EntitySearchAndSelectComponent;

  @ViewChild(
    "settingslicensePlateautoDriversForTheSelectedLicensePlateSearchAndSelect"
  )
  settingslicensePlateautoDriversForTheSelectedLicensePlateSearchAndSelect!: EntitySearchAndSelectComponent;

  @ViewChild(
    "settingslicensePlateaddDriversForTheSelectedLicensePlateSearchAndSelect"
  )
  settingslicensePlateaddDriversForTheSelectedLicensePlateSearchAndSelect!: EntitySearchAndSelectComponent;

  newLicencePlateInput: string = "";
  updateLicensePlateContentInput: string = "";
  updateLicensePlateUnknownCheckboxInput: boolean = false;
  lastSearchInput: string = "";
  selectedLicensePlateEntity: any;

  selectedDriverForTheSelectedLicensePlate: any;
  selectedDriverEverExistedWithSelectedLicensePlate: any;
  selectedDriverToAdd: any;

  driversForTheSelectedLicensePlate: any = [];
  driversEverExistedWithSelectedLicensePlate: any = [];

  clearSearchAndSelectFields() {
    this.settingslicensePlatedriversForTheSelectedLicensePlateSearchAndSelect.clearSearchText();
    this.settingslicensePlatedriversForTheSelectedLicensePlateSearchAndSelect.clearSelectedEntry();
    this.settingslicensePlateautoDriversForTheSelectedLicensePlateSearchAndSelect.clearSearchText();
    this.settingslicensePlateautoDriversForTheSelectedLicensePlateSearchAndSelect.clearSelectedEntry();
    this.settingslicensePlateaddDriversForTheSelectedLicensePlateSearchAndSelect.clearSearchText();
    this.settingslicensePlateaddDriversForTheSelectedLicensePlateSearchAndSelect.clearSelectedEntry();
  }

  calculateClass() {
    if (this.selectedLicensePlateEntity) {
      return "edit-license-plate-block";
    } else {
      return "edit-license-plate-none";
    }
  }

  async addNewLicensePlate() {
    let saveObject: any = {};
    saveObject.content = this.newLicencePlateInput.trim();
    saveObject.drivers = [];
    saveObject.unknown = false;
    saveObject.driversEverExistedWithThisLicensePlate = [];
    await LicensePlateService.createEntity(saveObject);
    this.newLicencePlateInput = "";
    if (this.lastSearchInput !== "") {
      await LicensePlateService.filterEntries(this.lastSearchInput);
      this.settingslicensePlatelicensePlateSearchAndSelect.setEntityArray(
        LicensePlateService.filteredLicensePlates
      );
    }
  }

  async filterForLicensePlates(searchTxt: string) {
    this.lastSearchInput = searchTxt;
    await LicensePlateService.filterEntries(searchTxt);
    this.settingslicensePlatelicensePlateSearchAndSelect.setEntityArray(
      LicensePlateService.filteredLicensePlates
    );
    this.selectedLicensePlateEntity = undefined;
    this.updateLicensePlateContentInput = "";
    this.driversForTheSelectedLicensePlate = [];
    this.selectedDriverForTheSelectedLicensePlate = undefined;
    this.selectedDriverEverExistedWithSelectedLicensePlate = undefined;
    this.selectedDriverToAdd = undefined;
    this.driversEverExistedWithSelectedLicensePlate = [];
    this.clearSearchAndSelectFields();
  }
  async selectedLicensePlate(licensePlateId: string) {
    this.driversForTheSelectedLicensePlate = [];
    this.driversEverExistedWithSelectedLicensePlate = [];
    const license_plate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a._id === licensePlateId) {
          return a;
        }
      }
    )[0];
    if (license_plate) {
      this.selectedLicensePlateEntity = license_plate;
      this.updateLicensePlateContentInput = license_plate.content;
      this.updateLicensePlateUnknownCheckboxInput = license_plate.unknown;
      license_plate!.drivers!.forEach((driverIdElement: string) => {
        const driver: any = DriverService.driverDocs.filter((a: any) => {
          if (a._id === driverIdElement) {
            return a;
          }
        })[0];
        if (driver !== undefined) {
          this.driversForTheSelectedLicensePlate.push(driver);
        }
      });
      if (license_plate.driversEverExistedWithThisLicensePlate) {
        license_plate.driversEverExistedWithThisLicensePlate.forEach(
          (driverIdElement: string) => {
            const driver: any = DriverService.driverDocs.filter((a: any) => {
              if (a._id === driverIdElement) {
                return a;
              }
            })[0];
            if (driver !== undefined) {
              this.driversEverExistedWithSelectedLicensePlate.push(driver);
            }
          }
        );
      }
      this.settingslicensePlatedriversForTheSelectedLicensePlateSearchAndSelect.setEntityArray(
        this.driversForTheSelectedLicensePlate
      );
      this.settingslicensePlateautoDriversForTheSelectedLicensePlateSearchAndSelect.setEntityArray(
        this.driversEverExistedWithSelectedLicensePlate
      );
      console.log(this.driversForTheSelectedLicensePlate);
      console.log(this.driversEverExistedWithSelectedLicensePlate);
    }
  }

  async editLicensePlate(licensePlateEntity: any) {
    licensePlateEntity.content = this.updateLicensePlateContentInput.trim();
    licensePlateEntity.unknown = this.updateLicensePlateUnknownCheckboxInput;
    await LicensePlateService.updateEntity(licensePlateEntity, false);
    this.selectedLicensePlateEntity = undefined;
    this.updateLicensePlateContentInput = "";
    await LicensePlateService.filterEntries(this.lastSearchInput);
    this.settingslicensePlatelicensePlateSearchAndSelect.setEntityArray(
      LicensePlateService.filteredLicensePlates
    );
  }
  async deleteLicensePlate(licensePlateEntity: any) {
    let result = confirm("Biztosan törölni szeretnéd?");
    if (result === true) {
      await LicensePlateService.updateEntity(licensePlateEntity, true);
      this.selectedLicensePlateEntity = undefined;
      this.updateLicensePlateContentInput = "";
      await this.filterForLicensePlates(this.lastSearchInput);
      this.settingslicensePlatelicensePlateSearchAndSelect.setEntityArray(
        LicensePlateService.filteredLicensePlates
      );
    }
  }

  async selectedDriversForTheSelectedLicensePlate(driverId: string) {
    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a._id === driverId) {
        return a;
      }
    })[0];
    if (driver) {
      this.selectedDriverForTheSelectedLicensePlate = driver;
    }
  }

  async selectedDriversEverExistedWithSelectedLicensePlate(driverId: string) {
    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a._id === driverId) {
        return a;
      }
    })[0];
    if (driver) {
      this.selectedDriverEverExistedWithSelectedLicensePlate = driver;
    }
  }

  async filterForDrivers(searchTxt: string) {
    await DriverService.filterEntries(searchTxt);
    this.settingslicensePlateaddDriversForTheSelectedLicensePlateSearchAndSelect.setEntityArray(
      DriverService.filteredDrivers
    );
  }
  async selectedDriver(driverId: string) {
    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a._id === driverId) {
        return a;
      }
    })[0];
    if (driver) {
      this.selectedDriverToAdd = driver;
    }
  }

  async addDriverToSelectedLicensePlate(
    selectedLicensePlateEntity: any,
    selectedDriverToAdd: any
  ) {
    console.log("addDriverToSelectedLicensePlate");
    console.log(selectedLicensePlateEntity);
    console.log(selectedDriverToAdd);
    if (!selectedLicensePlateEntity.drivers.includes(selectedDriverToAdd._id)) {
      selectedLicensePlateEntity.drivers.push(selectedDriverToAdd._id);
    }
    if (
      !selectedDriverToAdd.license_plates.includes(
        selectedLicensePlateEntity._id
      )
    ) {
      selectedDriverToAdd.license_plates.push(selectedLicensePlateEntity._id);
    }
    LicensePlateService.updateEntity(selectedLicensePlateEntity, false);
    DriverService.updateEntity(selectedDriverToAdd, false);
    this.clearSearchAndSelectFields();
    this.selectedDriverToAdd = undefined;
    await this.selectedLicensePlate(selectedLicensePlateEntity._id);
  }

  async deleteDriverFromTheLicensePlate(
    selectedLicensePlateEntity: any,
    selectedDriverToDelete: any
  ) {
    console.log("deleteDriverFromTheLicensePlate");
    console.log(selectedLicensePlateEntity);
    console.log(selectedDriverToDelete);
    if (
      selectedLicensePlateEntity.drivers.includes(selectedDriverToDelete._id)
    ) {
      selectedLicensePlateEntity.drivers =
        selectedLicensePlateEntity.drivers.filter(
          (driverid: string) => driverid !== selectedDriverToDelete._id
        );
    }
    if (
      selectedDriverToDelete.license_plates.includes(
        selectedLicensePlateEntity._id
      )
    ) {
      selectedDriverToDelete.license_plates =
        selectedDriverToDelete.license_plates.filter(
          (license_plate_id: string) =>
            license_plate_id !== selectedLicensePlateEntity._id
        );
    }
    LicensePlateService.updateEntity(selectedLicensePlateEntity, false);
    DriverService.updateEntity(selectedDriverToDelete, false);
    this.selectedDriverForTheSelectedLicensePlate = undefined;
    this.clearSearchAndSelectFields();
    await this.selectedLicensePlate(selectedLicensePlateEntity._id);
  }

  async deleteAutomaticDriverFromTheLicensePlate(
    selectedLicensePlateEntity: any,
    selectedDriverToDeleteFromAutomatic: any
  ) {
    console.log("deleteDriverFromTheLicensePlate");
    console.log(selectedLicensePlateEntity);
    console.log(selectedDriverToDeleteFromAutomatic);
    if (
      selectedLicensePlateEntity.driversEverExistedWithThisLicensePlate.includes(
        selectedDriverToDeleteFromAutomatic._id
      )
    ) {
      selectedLicensePlateEntity.driversEverExistedWithThisLicensePlate =
        selectedLicensePlateEntity.driversEverExistedWithThisLicensePlate.filter(
          (driverid: string) =>
            driverid !== selectedDriverToDeleteFromAutomatic._id
        );
    }
    if (
      selectedDriverToDeleteFromAutomatic.licensePlatesEverExistedForThisDriver.includes(
        selectedLicensePlateEntity._id
      )
    ) {
      selectedDriverToDeleteFromAutomatic.licensePlatesEverExistedForThisDriver =
        selectedDriverToDeleteFromAutomatic.licensePlatesEverExistedForThisDriver.filter(
          (license_plate_id: string) =>
            license_plate_id !== selectedLicensePlateEntity._id
        );
    }
    LicensePlateService.updateEntity(selectedLicensePlateEntity, false);
    DriverService.updateEntity(selectedDriverToDeleteFromAutomatic, false);
    this.selectedDriverEverExistedWithSelectedLicensePlate = undefined;
    this.clearSearchAndSelectFields();
    await this.selectedLicensePlate(selectedLicensePlateEntity._id);
  }
}
