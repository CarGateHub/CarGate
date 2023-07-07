import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { DestinationService } from "./destination.service";
import { LicensePlateService } from "./license-plate.service";
const PouchDB = require("pouchdb").default;

if (localStorage.getItem("app_username") !== null) {
  const sync_driver = PouchDB.sync(
    "driver",
    "https://" +
      localStorage.getItem("app_username") +
      ":" +
      localStorage.getItem("app_password") +
      "@" +
      localStorage.getItem("app_hostandport") +
      "/driver",
    {
      live: true,
      retry: true,
      heartbeat: 6000,
      batch_size: 2000,
    }
  )
    .on("change", async (info: any) => {
      // handle change
      console.log("driver change");
      console.log(info);
      await DriverService.analyzeChangeInfo(info);
      //getDriverDocsAndMapToEntries();
    })
    .on("paused", function (err: any) {
      //console.log(err);
      console.log("driver paused");
      // replication paused (e.g. replication up to date, user went offline)
    })
    .on("active", function () {
      console.log("driver active");
      // replicate resumed (e.g. new changes replicating, user went back online)
    })
    .on("denied", function (err: any) {
      console.log("driver denied");
      //console.log(err);
      // a document failed to replicate (e.g. due to permissions)
    })
    .on("complete", function (info: any) {
      console.log("driver complete");
      //console.log(info);
      // handle complete
    })
    .on("error", function (err: any) {
      console.log("driver error");
      //console.log(err);
      // handle error
    });
}

@Injectable({
  providedIn: "root",
})
export class DriverService {
  private static driverDB = PouchDB("driver");
  static driverDocs: any = [];
  static filteredDrivers = [];
  static filterObject: any = {};

  private static triggerSubjectForSearch = new Subject<void>();

  static get triggerASearch$(): Observable<void> {
    return DriverService.triggerSubjectForSearch.asObservable();
  }

  constructor() {}

  static async getDriverDocs() {
    try {
      DriverService.driverDocs = await DriverService.driverDB
        .allDocs({ include_docs: true })
        .then((result: any) => result.rows.map((row: any) => row.doc));
      console.log("driverDocs loaded");
    } catch (err) {
      console.log(err);
    }
  }

  static async filterEntriesByLastFilterObject() {
    if (DriverService.filterObject && DriverService.filterObject.search) {
      console.log("filterEntriesByLastFilterObject");
      await DriverService.filterEntries(DriverService.filterObject.search);
    }
  }

  static async filterEntries(searchTerm: string) {
    DriverService.filterObject = {
      search: searchTerm,
    };
    if (searchTerm.trim() === "") {
      DriverService.filteredDrivers = [];
      return;
    }
    //clearTableContent()

    const filteredEntries = DriverService.driverDocs.filter((entry: any) => {
      if (
        entry.content !== undefined &&
        (entry._deleted === false || entry._deleted === undefined)
      ) {
        const licensePlateContent = entry.content;
        entry.selected = undefined;
        return licensePlateContent.includes(searchTerm);
      }
    });

    DriverService.filteredDrivers = filteredEntries;
  }

  static convertEntity(entity_with_only_reference: any): any {
    const ret = {
      _id: entity_with_only_reference._id,
      _rev: entity_with_only_reference._rev,
      content: entity_with_only_reference.content,
      license_plates: entity_with_only_reference.license_plates,
      destinations: entity_with_only_reference.destinations,
      valid: entity_with_only_reference.valid,
      banned: entity_with_only_reference.banned,
    };
    return ret;
  }

  static removeEntityById(entity_id: any) {
    console.log("removeDriverById: " + entity_id);
    DriverService.driverDocs = DriverService.driverDocs.filter(
      (item: any) => !(item._id === entity_id)
    );
  }

  static handleNewEntity(entity_with_only_reference: any) {
    console.log("handleNewDriver: ");
    console.log(entity_with_only_reference);
    DriverService.driverDocs.unshift(
      DriverService.convertEntity(entity_with_only_reference)
    );
  }

  static handleUpdateEntity(entity_with_only_reference: any) {
    console.log("updateDriver: ");
    console.log(entity_with_only_reference);
    const objIndex: number = DriverService.driverDocs.findIndex(
      (obj: any) => obj._id == entity_with_only_reference._id
    );
    console.log(objIndex);
    DriverService.driverDocs[objIndex] = DriverService.convertEntity(
      entity_with_only_reference
    );
    //ez nem mindig triggerel keresést főleg ha egyszerre van állítva az hogy valid meg bannolt
    this.triggerSubjectForSearch.next();
  }

  static async analyzeChangeInfo(info: any) {
    console.log("analyzeChangeInfo");
    if (
      info &&
      info.direction &&
      info.direction === "pull" /*|| info.direction === "push"*/
    ) {
      if (info.change && info.change.docs && Array.isArray(info.change.docs)) {
        info.change.docs.forEach((element: any) => {
          if (element._deleted !== undefined) {
            if (element._deleted === true) {
              DriverService.removeEntityById(element._id);
            }
          } else {
            if (element._revisions !== undefined) {
              if (element._revisions.start !== undefined) {
                if (element._revisions.start === 1) {
                  DriverService.handleNewEntity(element);
                } else {
                  DriverService.handleUpdateEntity(element);
                }
              }
            }
          }
        });
        //await DriverService.filterEntriesByLastFilterObject(); //DriverService line will break the main three search and select if a new entry received by sync
        //update for filters not needed
      }
    }
  }
  /*
  static async createUnknownEntity(
    entity_content: string
  ): Promise<string | null> {
    const content = entity_content.trim();
    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a.content === content) {
        return a;
      }
    })[0];
    console.log(driver);
    if (driver !== undefined) {
      return driver._id;
    }
    let saveObject: any = {};
    saveObject.content = content;
    saveObject.unknown = true;
    saveObject._deleted = false;
    saveObject.license_plates = [];
    saveObject.destinations = [];

    saveObject.valid = false;
    saveObject.banned = false;
    saveObject.licensePlatesEverExistedForDriverServiceDriver = [];
    saveObject.destinationsEverExistedForThisDriver = [];

    let documentResult = await DriverService.createEntity(saveObject);
    if (documentResult.ok === true) {
      console.log("ID:" + documentResult.id);
      let entityResult = await DriverService.driverDB.get(documentResult.id, {
        rev: documentResult.rev,
      });
      console.log(entityResult._id);
      return entityResult._id;
    }
    return null;
  }
*/
  static async createEntity(entity: any) {
    try {
      console.log("createEntity -> Driver");
      console.log(entity);
      let saveObject: any = {};
      saveObject.content = entity.content;
      saveObject.license_plates = entity.license_plates;
      saveObject.destinations = entity.destinations;
      saveObject.valid = entity.valid;
      saveObject.banned = entity.banned;
      saveObject._deleted = false;
      let entrydb_post_result = await DriverService.driverDB.post(saveObject);
      if (entrydb_post_result.ok === true) {
        let entity = await DriverService.driverDB.get(entrydb_post_result.id);
        await DriverService.handleNewEntity(entity);
      }
      return entrydb_post_result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  static async updateEntity(entity: any, deleted_flag: boolean) {
    let res;
    try {
      res = await DriverService.driverDB.get(entity._id);
    } catch (err) {
      console.log(err);
    }
    if (res === undefined) {
      throw Error(
        "Update is not possible because the entity id is not in the database"
      );
    }
    let updateObject: any = {};
    updateObject._id = entity._id;
    updateObject._rev = res._rev;
    updateObject.content = entity.content;
    updateObject.license_plates = entity.license_plates;
    updateObject.destinations = entity.destinations;
    updateObject.valid = entity.valid;
    updateObject.banned = entity.banned;
    if (deleted_flag) {
      updateObject._deleted = deleted_flag;
    }
    try {
      let entrydb_put_result = await DriverService.driverDB.put(updateObject);
      if (entrydb_put_result.ok === true && deleted_flag === false) {
        let entity = await DriverService.driverDB.get(entrydb_put_result.id);
        await DriverService.handleUpdateEntity(entity);
      } else if (entrydb_put_result.ok === true && deleted_flag === true) {
        await DriverService.removeEntityById(entrydb_put_result.id);

        await DestinationService.removedriver_from_drivers(entity._id);

        await LicensePlateService.removedriver_from_drivers(entity._id);
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async setEveryValidPropertyToFalse() {
    const validDrivers: any[] = DriverService.driverDocs.filter((a: any) => {
      if (a.valid === true) {
        return a;
      }
    });
    validDrivers.forEach(async (validDriver) => {
      validDriver.valid = false;
      await DriverService.updateEntity(validDriver, false);
    });
    console.log(validDrivers);
  }
  /*
  static async autoAddLicensePlateAndDestination(
    driverId: string,
    licensePlateId: string,
    destinationId: string
  ) {
    console.log("autoAddDestination");
    let updateNeeded: boolean = false;
    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a._id === driverId) {
        return a;
      }
    })[0];
    if (driver) {
      console.log("driver found");
      if (driver.licensePlatesEverExistedForDriverServiceDriver) {
        if (
          !driver.licensePlatesEverExistedForDriverServiceDriver.includes(
            licensePlateId
          )
        ) {
          driver.licensePlatesEverExistedForDriverServiceDriver.push(
            licensePlateId
          );
          updateNeeded = true;
        } else {
          updateNeeded = false;
        }
      } else {
        driver.licensePlatesEverExistedForDriverServiceDriver = [];
        driver.licensePlatesEverExistedForDriverServiceDriver.push(
          licensePlateId
        );
      }

      if (driver.destinationsEverExistedForThisDriver) {
        if (
          !driver.destinationsEverExistedForThisDriver.includes(destinationId)
        ) {
          console.log("destination not assigned yet");
          driver.destinationsEverExistedForThisDriver.push(destinationId);
          console.log(driver.destinationsEverExistedForThisDriver);
          updateNeeded = true;
        } else {
          if (updateNeeded === true) {
            updateNeeded = false;
          }
          console.log("destination already assigned");
        }
      } else {
        driver.destinationsEverExistedForThisDriver = [];
        driver.destinationsEverExistedForThisDriver.push(destinationId);
        updateNeeded = true;
      }
      console.log(driver);
      if (updateNeeded) {
        await DriverService.updateEntity(driver, false);
      } else {
        console.log("update not needed");
      }
    }
  }

  static async remove_LicensePlate_from_licensePlatesEverExistedForDriverServiceDriver(
    licensePlateId: string
  ) {
    const drivers_with_license_plate: any[] = DriverService.driverDocs.filter(
      (a: any) => {
        if (
          a.licensePlatesEverExistedForDriverServiceDriver.includes(
            licensePlateId
          )
        ) {
          return a;
        }
      }
    );
    drivers_with_license_plate.forEach(async (driver: any) => {
      const filtered_license_plates: any[] =
        driver.licensePlatesEverExistedForDriverServiceDriver.filter(
          (a: any) => {
            if (a !== licensePlateId) {
              return a;
            }
          }
        );
      driver.licensePlatesEverExistedForDriverServiceDriver =
        filtered_license_plates;
      await DriverService.updateEntity(driver, false);
    });
  }
*/
  static async remove_LicensePlate_from_licensePlates(licensePlateId: string) {
    const drivers_with_license_plate: any[] = DriverService.driverDocs.filter(
      (a: any) => {
        if (a.license_plates.includes(licensePlateId)) {
          return a;
        }
      }
    );
    drivers_with_license_plate.forEach(async (driver: any) => {
      const filtered_license_plates: any[] = driver.license_plates.filter(
        (a: any) => {
          if (a !== licensePlateId) {
            return a;
          }
        }
      );
      driver.license_plates = filtered_license_plates;
      await DriverService.updateEntity(driver, false);
    });
  }

  static async remove_destination_from_destinations(destinationId: string) {
    const drivers_with_destination: any[] = DriverService.driverDocs.filter(
      (a: any) => {
        if (a.destinations.includes(destinationId)) {
          return a;
        }
      }
    );
    drivers_with_destination.forEach(async (driver: any) => {
      const filtered_destinations: any[] = driver.destinations.filter(
        (a: any) => {
          if (a !== destinationId) {
            return a;
          }
        }
      );
      driver.destinations = filtered_destinations;
      await DriverService.updateEntity(driver, false);
    });
  }
  /*
  static async remove_destination_from_destinationsEverExistedForThisDriver(
    destinationId: string
  ) {
    const drivers_with_destination: any[] = DriverService.driverDocs.filter(
      (a: any) => {
        if (a.destinationsEverExistedForThisDriver.includes(destinationId)) {
          return a;
        }
      }
    );
    drivers_with_destination.forEach(async (driver: any) => {
      const filtered_destinations: any[] =
        driver.destinationsEverExistedForThisDriver.filter((a: any) => {
          if (a !== destinationId) {
            return a;
          }
        });
      driver.destinationsEverExistedForThisDriver = filtered_destinations;
      await DriverService.updateEntity(driver, false);
    });
  }
  */
}
