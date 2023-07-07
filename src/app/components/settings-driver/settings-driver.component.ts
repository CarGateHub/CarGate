import { Component, ViewChild } from "@angular/core";
import { DestinationService } from "src/app/services/destination.service";
import { DriverService } from "src/app/services/driver.service";
import { LicensePlateService } from "src/app/services/license-plate.service";
import { EntitySearchAndSelectComponent } from "../entity-search-and-select/entity-search-and-select.component";

@Component({
  selector: "app-settings-driver",
  templateUrl: "./settings-driver.component.html",
  styleUrls: ["./settings-driver.component.css"],
})
export class SettingsDriverComponent {
  constructor(
    public licensePlateService: LicensePlateService,
    public destinationService: DestinationService,
    public driverService: DriverService
  ) {}
  newDriverInput: string = "";
  newDriverValidCheckboxInput: boolean = false;
  newDriverBannedCheckboxInput: boolean = false;

  updateDriverInput: string = "";
  updateDriverValidCheckboxInput: boolean = false;
  updateDriverBannedCheckboxInput: boolean = false;
  updateDriverUnknownCheckboxInput: boolean = false;

  @ViewChild("settingsdriverdriverSearchAndSelect")
  settingsdriverdriverSearchAndSelect!: EntitySearchAndSelectComponent;

  @ViewChild("settingsdriverdestinationsSearchAndSelecForSelectedDriver")
  settingsdriverdestinationsSearchAndSelecForSelectedDriver!: EntitySearchAndSelectComponent;

  @ViewChild("settingsdriverautoDestinationsSearchAndSelecForSelectedDriver")
  settingsdriverautoDestinationsSearchAndSelecForSelectedDriver!: EntitySearchAndSelectComponent;

  @ViewChild("settingsdriveraddDestinationSearchAndSelecForSelectedDriver")
  settingsdriveraddDestinationSearchAndSelecForSelectedDriver!: EntitySearchAndSelectComponent;

  @ViewChild("settingsdriverlicensePlatesSearchAndSelecForSelectedDriver")
  settingsdriverlicensePlatesSearchAndSelecForSelectedDriver!: EntitySearchAndSelectComponent;

  @ViewChild("settingsdriverautoLicensePlatesSearchAndSelecForSelectedDriver")
  settingsdriverautoLicensePlatesSearchAndSelecForSelectedDriver!: EntitySearchAndSelectComponent;

  @ViewChild("settingsdriveraddLicensePlatesSearchAndSelecForSelectedDriver")
  settingsdriveraddLicensePlatesSearchAndSelecForSelectedDriver!: EntitySearchAndSelectComponent;

  selectedDriverEntity: any;
  selectedDestinationForSelectedDriver: any;
  selectedAutoDestinationForSelectedDriver: any;
  selectedAddDestinationForSelectedDriver: any;
  selectedLicensePlatesForSelectedDriver: any;
  selectedAutoLicensePlatesForSelectedDriver: any;
  selectedAddLicensePlatesForSelectedDriver: any;

  destinationsForSelectedDriver: any = [];
  autoDestinationsForSelectedDriver: any = [];
  licensePlatesForSelectedDriver: any = [];
  autoLicensePlatesForSelectedDriver: any = [];

  filterForDriversSearchTxt: string = "";

  clearSelectedEntities() {
    this.selectedDriverEntity = undefined;
    this.selectedDestinationForSelectedDriver = undefined;
    this.selectedAutoDestinationForSelectedDriver = undefined;
    this.selectedAddDestinationForSelectedDriver = undefined;
    this.selectedLicensePlatesForSelectedDriver = undefined;
    this.selectedAutoLicensePlatesForSelectedDriver = undefined;
    this.selectedAddLicensePlatesForSelectedDriver = undefined;
  }

  clearSearchAndSelectFields() {
    this.settingsdriverdestinationsSearchAndSelecForSelectedDriver.clearSearchText();
    this.settingsdriverdestinationsSearchAndSelecForSelectedDriver.clearSelectedEntry();
    this.settingsdriverautoDestinationsSearchAndSelecForSelectedDriver.clearSearchText();
    this.settingsdriverautoDestinationsSearchAndSelecForSelectedDriver.clearSelectedEntry();
    this.settingsdriveraddDestinationSearchAndSelecForSelectedDriver.clearSearchText();
    this.settingsdriveraddDestinationSearchAndSelecForSelectedDriver.clearSelectedEntry();

    this.settingsdriverlicensePlatesSearchAndSelecForSelectedDriver.clearSearchText();
    this.settingsdriverlicensePlatesSearchAndSelecForSelectedDriver.clearSelectedEntry();
    this.settingsdriverautoLicensePlatesSearchAndSelecForSelectedDriver.clearSearchText();
    this.settingsdriverautoLicensePlatesSearchAndSelecForSelectedDriver.clearSelectedEntry();
    this.settingsdriveraddLicensePlatesSearchAndSelecForSelectedDriver.clearSearchText();
    this.settingsdriveraddLicensePlatesSearchAndSelecForSelectedDriver.clearSelectedEntry();
  }

  calculateClass() {
    if (this.selectedDriverEntity) {
      return "edit-driver-block";
    } else {
      return "edit-driver-none";
    }
  }

  setEveryValidPropertyToFalse() {
    let result = confirm(
      "Biztosan vissza szeretnéd vonni az összes érvényes belépőt?"
    );
    if (result === true) {
      DriverService.setEveryValidPropertyToFalse();
    }
  }

  DriverService_filteredDrivers() {
    return DriverService.filteredDrivers;
  }

  async addNewDriver() {
    let saveObject: any = {};
    saveObject.content = this.newDriverInput.trim();
    saveObject.unknown = false;

    saveObject.license_plates = [];
    saveObject.destinations = [];
    saveObject.valid = this.newDriverValidCheckboxInput;
    saveObject.banned = this.newDriverBannedCheckboxInput;
    saveObject.licensePlatesEverExistedForThisDriver = [];
    saveObject.destinationsEverExistedForThisDriver = [];

    await DriverService.createEntity(saveObject);
    this.newDriverInput = "";
    if (this.filterForDriversSearchTxt !== "") {
      await DriverService.filterEntries(this.filterForDriversSearchTxt);
      this.settingsdriverdriverSearchAndSelect.setEntityArray(
        DriverService.filteredDrivers
      );
    }
  }

  async updateDriver(driverEntity: any) {
    driverEntity.content = this.updateDriverInput.trim();
    driverEntity.banned = this.updateDriverBannedCheckboxInput;
    driverEntity.unknown = this.updateDriverUnknownCheckboxInput;
    driverEntity.valid = this.updateDriverValidCheckboxInput;
    await DriverService.updateEntity(driverEntity, false);
    this.selectedDriverEntity = undefined;
    this.updateDriverInput = "";
    if (this.filterForDriversSearchTxt !== "") {
      await DriverService.filterEntries(this.filterForDriversSearchTxt);
      this.settingsdriverdriverSearchAndSelect.setEntityArray(
        DriverService.filteredDrivers
      );
    }
  }
  async deleteDriver(driverEntity: any) {
    let result = confirm("Biztosan törölni szeretnéd?");
    if (result === true) {
      await DriverService.updateEntity(driverEntity, true);
      this.selectedDriverEntity = undefined;
      this.updateDriverInput = "";
      if (this.filterForDriversSearchTxt !== "") {
        await DriverService.filterEntries(this.filterForDriversSearchTxt);
        this.settingsdriverdriverSearchAndSelect.setEntityArray(
          DriverService.filteredDrivers
        );
      }
    }
  }

  async filterForDrivers(searchTxt: string) {
    this.clearSelectedEntities();
    this.clearSearchAndSelectFields();
    this.filterForDriversSearchTxt = searchTxt;
    await DriverService.filterEntries(searchTxt);
    this.settingsdriverdriverSearchAndSelect.setEntityArray(
      DriverService.filteredDrivers
    );
  }
  async selectDriver(driverId: string) {
    this.destinationsForSelectedDriver = [];
    this.autoDestinationsForSelectedDriver = [];
    this.licensePlatesForSelectedDriver = [];
    this.autoLicensePlatesForSelectedDriver = [];

    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a._id === driverId) {
        return a;
      }
    })[0];
    if (driver) {
      this.selectedDriverEntity = driver;
      this.updateDriverInput = driver.content;
      this.updateDriverBannedCheckboxInput = driver.banned;
      this.updateDriverUnknownCheckboxInput = driver.unknown;
      this.updateDriverValidCheckboxInput = driver.valid;
      driver!.destinations!.forEach((destinationId: string) => {
        const destination: any = DestinationService.destinationDocs.filter(
          (a: any) => {
            if (a._id === destinationId) {
              return a;
            }
          }
        )[0];
        if (destination !== undefined) {
          this.destinationsForSelectedDriver.push(destination);
        }
      });
      if (driver.destinationsEverExistedForThisDriver) {
        driver.destinationsEverExistedForThisDriver.forEach(
          (destinationIdElement: string) => {
            const destination: any = DestinationService.destinationDocs.filter(
              (a: any) => {
                if (a._id === destinationIdElement) {
                  return a;
                }
              }
            )[0];
            if (destination !== undefined) {
              this.autoDestinationsForSelectedDriver.push(destination);
            }
          }
        );
      }

      driver.license_plates!.forEach((licensePlateId: string) => {
        const licensePlate: any = LicensePlateService.licensePlateDocs.filter(
          (a: any) => {
            if (a._id === licensePlateId) {
              return a;
            }
          }
        )[0];
        if (licensePlate !== undefined) {
          this.licensePlatesForSelectedDriver.push(licensePlate);
        }
      });
      if (driver.licensePlatesEverExistedForThisDriver) {
        driver.licensePlatesEverExistedForThisDriver!.forEach(
          (licensePlateId: string) => {
            const licensePlate: any =
              LicensePlateService.licensePlateDocs.filter((a: any) => {
                if (a._id === licensePlateId) {
                  return a;
                }
              })[0];
            if (licensePlate !== undefined) {
              this.autoLicensePlatesForSelectedDriver.push(licensePlate);
            }
          }
        );
      }

      this.settingsdriverdestinationsSearchAndSelecForSelectedDriver.setEntityArray(
        this.destinationsForSelectedDriver
      );
      this.settingsdriverautoDestinationsSearchAndSelecForSelectedDriver.setEntityArray(
        this.autoDestinationsForSelectedDriver
      );
      this.settingsdriverlicensePlatesSearchAndSelecForSelectedDriver.setEntityArray(
        this.licensePlatesForSelectedDriver
      );
      this.settingsdriverautoLicensePlatesSearchAndSelecForSelectedDriver.setEntityArray(
        this.autoLicensePlatesForSelectedDriver
      );
    }
  }

  async selectDestinationForSelectedDriver(destinationId: string) {
    const destination: any = DestinationService.destinationDocs.filter(
      (a: any) => {
        if (a._id === destinationId) {
          return a;
        }
      }
    )[0];
    if (destination) {
      this.selectedDestinationForSelectedDriver = destination;
    }
  }

  async selectAutoDestinationForSelectedDriver(destinationId: string) {
    const destination: any = DestinationService.destinationDocs.filter(
      (a: any) => {
        if (a._id === destinationId) {
          return a;
        }
      }
    )[0];
    if (destination) {
      this.selectedAutoDestinationForSelectedDriver = destination;
    }
  }

  async filterForAddDestinationForSelectedDriver(searchTxt: string) {
    DestinationService.filterEntries(searchTxt);
    this.settingsdriveraddDestinationSearchAndSelecForSelectedDriver.setEntityArray(
      DestinationService.filteredDestinations
    );
  }
  async selectAddDestinationForSelectedDriver(destinationId: string) {
    const destination: any = DestinationService.destinationDocs.filter(
      (a: any) => {
        if (a._id === destinationId) {
          return a;
        }
      }
    )[0];
    if (destination) {
      this.selectedAddDestinationForSelectedDriver = destination;
    }
  }

  async selectLicensePlatesForSelectedDriver(licensePlateId: string) {
    const licensePlate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a._id === licensePlateId) {
          return a;
        }
      }
    )[0];
    if (licensePlate) {
      this.selectedLicensePlatesForSelectedDriver = licensePlate;
    }
  }

  async selectAutoLicensePlatesForSelectedDriver(licensePlateId: string) {
    const licensePlate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a._id === licensePlateId) {
          return a;
        }
      }
    )[0];
    if (licensePlate) {
      this.selectedAutoLicensePlatesForSelectedDriver = licensePlate;
    }
  }

  async filterForAddLicensePlatesForSelectedDriver(searchTxt: string) {
    LicensePlateService.filterEntries(searchTxt);
    this.settingsdriveraddLicensePlatesSearchAndSelecForSelectedDriver.setEntityArray(
      LicensePlateService.filteredLicensePlates
    );
  }
  async selectAddLicensePlatesForSelectedDriver(licensePlateId: string) {
    const licensePlate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a._id === licensePlateId) {
          return a;
        }
      }
    )[0];
    if (licensePlate) {
      this.selectedAddLicensePlatesForSelectedDriver = licensePlate;
    }
  }

  async deleteDestinationFromTheDriver(
    driverEntity: any,
    DestinationEntity: any
  ) {
    console.log("deleteDestinationFromTheDriver");
    console.log(DestinationEntity);
    console.log(driverEntity);
    if (driverEntity.destinations.includes(DestinationEntity._id)) {
      driverEntity.destinations = driverEntity.destinations.filter(
        (destinationId: string) => destinationId !== DestinationEntity._id
      );
    }
    if (DestinationEntity.drivers.includes(driverEntity._id)) {
      DestinationEntity.drivers = DestinationEntity.drivers.filter(
        (driverId: string) => driverId !== driverEntity._id
      );
    }
    await DestinationService.updateEntity(DestinationEntity, false);
    await DriverService.updateEntity(driverEntity, false);
    this.selectedDestinationForSelectedDriver = undefined;
    this.clearSearchAndSelectFields();
    await this.selectDriver(driverEntity._id);
  }

  async deleteAutoDestinationFromTheDriver(
    driverEntity: any,
    DestinationEntity: any
  ) {
    console.log("deleteAutoDestinationFromTheDriver");
    console.log(DestinationEntity);
    console.log(driverEntity);
    if (
      driverEntity.destinationsEverExistedForThisDriver.includes(
        DestinationEntity._id
      )
    ) {
      driverEntity.destinationsEverExistedForThisDriver =
        driverEntity.destinationsEverExistedForThisDriver.filter(
          (destinationId: string) => destinationId !== DestinationEntity._id
        );
    }
    if (
      DestinationEntity.driversEverExistedWithThisDestination.includes(
        driverEntity._id
      )
    ) {
      DestinationEntity.driversEverExistedWithThisDestination =
        DestinationEntity.driversEverExistedWithThisDestination.filter(
          (driverId: string) => driverId !== driverEntity._id
        );
    }
    await DestinationService.updateEntity(DestinationEntity, false);
    await DriverService.updateEntity(driverEntity, false);
    this.selectedAutoDestinationForSelectedDriver = undefined;
    this.clearSearchAndSelectFields();
    await this.selectDriver(driverEntity._id);
  }

  async addDestinationToSelectedDriver(
    driverEntity: any,
    DestinationEntity: any
  ) {
    console.log("addDestinationToSelectedDriver");
    console.log(driverEntity);
    console.log(DestinationEntity);
    if (DestinationEntity.drivers) {
      if (!DestinationEntity.drivers.includes(driverEntity._id)) {
        DestinationEntity.drivers.push(driverEntity._id);
      }
    } else {
      DestinationEntity.drivers = [];
      DestinationEntity.drivers.push(driverEntity._id);
    }
    if (driverEntity.destinations) {
      if (!driverEntity.destinations.includes(DestinationEntity._id)) {
        driverEntity.destinations.push(DestinationEntity._id);
      }
    } else {
      driverEntity.destinations = [];
      driverEntity.destinations.push(DestinationEntity._id);
    }
    await DestinationService.updateEntity(DestinationEntity, false);
    await DriverService.updateEntity(driverEntity, false);
    this.clearSearchAndSelectFields();
    this.selectedAddDestinationForSelectedDriver = undefined;
    await this.selectDriver(driverEntity._id);
  }

  async deleteLicensePlateFromTheDriver(
    driverEntity: any,
    LicensePLateEntity: any
  ) {
    console.log("deleteLicensePlateFromTheDriver");
    console.log(LicensePLateEntity);
    console.log(driverEntity);
    if (LicensePLateEntity.drivers.includes(driverEntity._id)) {
      LicensePLateEntity.drivers = LicensePLateEntity.drivers.filter(
        (driverid: string) => driverid !== driverEntity._id
      );
    }
    if (driverEntity.license_plates.includes(LicensePLateEntity._id)) {
      driverEntity.license_plates = driverEntity.license_plates.filter(
        (license_plate_id: string) =>
          license_plate_id !== LicensePLateEntity._id
      );
    }
    await LicensePlateService.updateEntity(LicensePLateEntity, false);
    await DriverService.updateEntity(driverEntity, false);
    this.selectedLicensePlatesForSelectedDriver = undefined;
    this.clearSearchAndSelectFields();
    await this.selectDriver(driverEntity._id);
  }

  async deleteAutoLicensePlateFromTheDriver(
    driverEntity: any,
    LicensePLateEntity: any
  ) {
    console.log("deleteAutoLicensePlateFromTheDriver");
    console.log(LicensePLateEntity);
    console.log(driverEntity);
    if (
      LicensePLateEntity.driversEverExistedWithThisLicensePlate.includes(
        driverEntity._id
      )
    ) {
      LicensePLateEntity.driversEverExistedWithThisLicensePlate =
        LicensePLateEntity.driversEverExistedWithThisLicensePlate.filter(
          (driverid: string) => driverid !== driverEntity._id
        );
    }
    if (
      driverEntity.licensePlatesEverExistedForThisDriver.includes(
        LicensePLateEntity._id
      )
    ) {
      driverEntity.licensePlatesEverExistedForThisDriver =
        driverEntity.licensePlatesEverExistedForThisDriver.filter(
          (license_plate_id: string) =>
            license_plate_id !== LicensePLateEntity._id
        );
    }
    await LicensePlateService.updateEntity(LicensePLateEntity, false);
    await DriverService.updateEntity(driverEntity, false);
    this.selectedAutoLicensePlatesForSelectedDriver = undefined;
    this.clearSearchAndSelectFields();
    await this.selectDriver(driverEntity._id);
  }

  async addLicensePlateToSelectedDriver(
    driverEntity: any,
    LicensePLateEntity: any
  ) {
    console.log("addLicensePlateToSelectedDriver");
    console.log(driverEntity);
    console.log(LicensePLateEntity);
    if (!LicensePLateEntity.drivers.includes(driverEntity._id)) {
      LicensePLateEntity.drivers.push(driverEntity._id);
    }
    if (!driverEntity.license_plates.includes(LicensePLateEntity._id)) {
      driverEntity.license_plates.push(LicensePLateEntity._id);
    }
    await LicensePlateService.updateEntity(LicensePLateEntity, false);
    await DriverService.updateEntity(driverEntity, false);
    this.clearSearchAndSelectFields();
    this.selectedAddLicensePlatesForSelectedDriver = undefined;
    await this.selectDriver(driverEntity._id);
  }
}
