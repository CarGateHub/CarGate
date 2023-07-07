import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { DriverService } from "./driver.service";
const PouchDB = require("pouchdb").default;

if (localStorage.getItem("app_username") !== null) {
  const sync_license_plate = PouchDB.sync(
    "license_plate",
    "https://" +
      localStorage.getItem("app_username") +
      ":" +
      localStorage.getItem("app_password") +
      "@" +
      localStorage.getItem("app_hostandport") +
      "/license_plate",
    {
      live: true,
      retry: true,
      batch_size: 2000,
      heartbeat: 6000,
    }
  )
    .on("change", async (info: any) => {
      // handle change
      console.log("license_plate change");
      console.log(info);
      await LicensePlateService.analyzeChangeInfo(info);
      //getLicensePlateDocsAndMapToEntries();
    })
    .on("paused", function (err: any) {
      //console.log(err);
      console.log("license_plate paused");
      // replication paused (e.g. replication up to date, user went offline)
    })
    .on("active", function () {
      console.log("license_plate active");
      // replicate resumed (e.g. new changes replicating, user went back online)
    })
    .on("denied", function (err: any) {
      console.log("license_plate denied");
      //console.log(err);
      // a document failed to replicate (e.g. due to permissions)
    })
    .on("complete", function (info: any) {
      console.log("license_plate complete");
      //console.log(info);
      // handle complete
    })
    .on("error", function (err: any) {
      console.log("license_plate error");
      //console.log(err);
      // handle error
    });
}

@Injectable({
  providedIn: "root",
})
export class LicensePlateService {
  private static licensePlateDB = PouchDB("license_plate");
  static licensePlateDocs: any = [];
  static filteredLicensePlates = [];
  static filterObject: any = {};

  private static triggerSubjectForSearch = new Subject<void>();

  static get triggerASearch$(): Observable<void> {
    return LicensePlateService.triggerSubjectForSearch.asObservable();
  }

  constructor() {}

  static async getLicensePlateDocs() {
    try {
      LicensePlateService.licensePlateDocs =
        await LicensePlateService.licensePlateDB
          .allDocs({ include_docs: true })
          .then((result: any) => result.rows.map((row: any) => row.doc));
      console.log("licensePlateDocs loaded");
    } catch (err) {
      console.log(err);
    }
  }

  static async filterEntriesByLastFilterObject() {
    if (
      LicensePlateService.filterObject &&
      LicensePlateService.filterObject.search
    ) {
      console.log("filterEntriesByLastFilterObject");
      await LicensePlateService.filterEntries(
        LicensePlateService.filterObject.search
      );
    }
  }

  static async filterEntries(searchTerm: string) {
    LicensePlateService.filterObject = {
      search: searchTerm,
    };
    if (searchTerm.trim() === "") {
      LicensePlateService.filteredLicensePlates = [];
      return;
    }
    //clearTableContent()
    const filteredEntries = LicensePlateService.licensePlateDocs.filter(
      (entry: any) => {
        if (
          entry.content !== undefined &&
          (entry._deleted === false || entry._deleted === undefined)
        ) {
          const licensePlateContent = entry.content;
          entry.selected = undefined;
          return licensePlateContent.includes(searchTerm);
        }
      }
    );
    LicensePlateService.filteredLicensePlates = filteredEntries;
  }

  static convertEntity(entity_with_only_reference: any): any {
    const ret = {
      _id: entity_with_only_reference._id,
      _rev: entity_with_only_reference._rev,
      content: entity_with_only_reference.content,
      drivers: entity_with_only_reference.drivers,
    };
    return ret;
  }

  static removeEntityById(entity_id: any) {
    console.log("removeLicensePlateById: " + entity_id);
    LicensePlateService.licensePlateDocs =
      LicensePlateService.licensePlateDocs.filter(
        (item: any) => !(item._id === entity_id)
      );
  }

  static handleNewEntity(entity_with_only_reference: any) {
    console.log("handleNewLicensePlate: ");
    console.log(entity_with_only_reference);
    LicensePlateService.licensePlateDocs.unshift(
      LicensePlateService.convertEntity(entity_with_only_reference)
    );
  }

  static handleUpdateEntity(entity_with_only_reference: any) {
    console.log("updateLicensePlate: ");
    console.log(entity_with_only_reference);
    const objIndex: number = LicensePlateService.licensePlateDocs.findIndex(
      (obj: any) => obj._id == entity_with_only_reference._id
    );
    console.log(objIndex);
    LicensePlateService.licensePlateDocs[objIndex] =
      LicensePlateService.convertEntity(entity_with_only_reference);
    this.triggerSubjectForSearch.next();
  }

  static async analyzeChangeInfo(info: any) {
    console.log("analyzeChangeInfo");
    if (
      info &&
      info.direction &&
      info.direction === "pull" /*||
      info.direction === "push"*/
    ) {
      if (info.change && info.change.docs && Array.isArray(info.change.docs)) {
        info.change.docs.forEach((element: any) => {
          if (element._deleted !== undefined) {
            if (element._deleted === true) {
              LicensePlateService.removeEntityById(element._id);
            }
          } else {
            if (element._revisions !== undefined) {
              if (element._revisions.start !== undefined) {
                if (element._revisions.start === 1) {
                  LicensePlateService.handleNewEntity(element);
                } else {
                  LicensePlateService.handleUpdateEntity(element);
                }
              }
            }
          }
        });
        //await LicensePlateService.filterEntriesByLastFilterObject();
      }
    }
  }
  /*
  static async createUnknownEntity(
    entity_content: string
  ): Promise<string | null> {
    const content = entity_content.trim();
    const licensePlate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a.content === content) {
          return a;
        }
      }
    )[0];
    console.log(licensePlate);
    if (licensePlate !== undefined) {
      return licensePlate._id;
    }
    let saveObject: any = {};
    saveObject.content = content;
    saveObject.drivers = [];
    saveObject.unknown = true;
    saveObject._deleted = false;
    saveObject.driversEverExistedWithThisLicensePlate = [];
    let documentResult = await LicensePlateService.createEntity(saveObject);
    if (documentResult.ok === true) {
      console.log("ID:" + documentResult.id);
      let entityResult = await LicensePlateService.licensePlateDB.get(
        documentResult.id,
        {
          rev: documentResult.rev,
        }
      );
      console.log(entityResult._id);
      return entityResult._id;
    }
    return null;
  }
*/
  static async createEntity(entity: any) {
    try {
      console.log("createEntity -> LicensePlate");
      console.log(entity);
      let saveObject: any = {};
      saveObject.content = entity.content;
      saveObject.drivers = entity.drivers;
      saveObject._deleted = false;

      let entrydb_post_result = await LicensePlateService.licensePlateDB.post(
        saveObject
      );
      if (entrydb_post_result.ok === true) {
        let entity = await LicensePlateService.licensePlateDB.get(
          entrydb_post_result.id
        );
        await LicensePlateService.handleNewEntity(entity);
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
      res = await LicensePlateService.licensePlateDB.get(entity._id);
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
    updateObject.drivers = entity.drivers;
    if (deleted_flag) {
      updateObject._deleted = deleted_flag;
    }
    try {
      let entrydb_put_result = await LicensePlateService.licensePlateDB.put(
        updateObject
      );
      if (entrydb_put_result.ok === true && deleted_flag === false) {
        let entity = await LicensePlateService.licensePlateDB.get(
          entrydb_put_result.id
        );
        await LicensePlateService.handleUpdateEntity(entity);
      } else if (entrydb_put_result.ok === true && deleted_flag === true) {
        await LicensePlateService.removeEntityById(entrydb_put_result.id);

        await DriverService.remove_LicensePlate_from_licensePlates(entity._id);
      }
    } catch (err) {
      console.log(err);
    }
  }
  /*
  static async autoAddDriver(licensePlateId: string, driverId: string) {
    console.log(
      "autoAddDriver with licensePlateId:" +
        licensePlateId +
        " and driverId:" +
        driverId
    );
    let updateNeeded: boolean = false;
    const license_plate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a._id === licensePlateId) {
          return a;
        }
      }
    )[0];
    if (license_plate) {
      console.log("license_plate found");
      if (license_plate.driversEverExistedWithThisLicensePlate) {
        if (
          !license_plate.driversEverExistedWithThisLicensePlate.includes(
            driverId
          )
        ) {
          license_plate.driversEverExistedWithThisLicensePlate.push(driverId);
          updateNeeded = true;
        } else {
          updateNeeded = false;
        }
      } else {
        license_plate.driversEverExistedWithThisLicensePlate = [];
        license_plate.driversEverExistedWithThisLicensePlate.push(driverId);
        updateNeeded = true;
      }
      if (updateNeeded) {
        console.log("LicensePlateService.updateEntity");
        await LicensePlateService.updateEntity(license_plate, false);
      }
    } else {
      console.log("license_plate not found");
    }
  }
*/
  static async removedriver_from_drivers(driverId: string) {
    const licensePlates_with_driver: any[] =
      LicensePlateService.licensePlateDocs.filter((a: any) => {
        if (a.drivers.includes(driverId)) {
          return a;
        }
      });
    licensePlates_with_driver.forEach(async (licensePlate: any) => {
      const filtered_drivers: any[] = licensePlate.drivers.filter((a: any) => {
        if (a !== driverId) {
          return a;
        }
      });
      licensePlate.drivers = filtered_drivers;
      await LicensePlateService.updateEntity(licensePlate, false);
    });
  }
  /*
  static async removedriver_from_driversEverExistedWithThisLicensePlate(
    driverId: string
  ) {
    const licensePlates_with_driver: any[] =
      LicensePlateService.licensePlateDocs.filter((a: any) => {
        if (a.driversEverExistedWithThisLicensePlate.includes(driverId)) {
          return a;
        }
      });
    licensePlates_with_driver.forEach(async (licensePlate: any) => {
      const filtered_drivers: any[] =
        licensePlate.driversEverExistedWithThisLicensePlate.filter((a: any) => {
          if (a !== driverId) {
            return a;
          }
        });
      licensePlate.driversEverExistedWithThisLicensePlate = filtered_drivers;
      await LicensePlateService.updateEntity(licensePlate, false);
    });
  }
  */
}
