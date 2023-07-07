import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { DriverService } from "./driver.service";
const PouchDB = require("pouchdb").default;

if (localStorage.getItem("app_username") !== null) {
  const sync_destination = PouchDB.sync(
    "destination",
    "https://" +
      localStorage.getItem("app_username") +
      ":" +
      localStorage.getItem("app_password") +
      "@" +
      localStorage.getItem("app_hostandport") +
      "/destination",
    {
      live: true,
      retry: true,

      heartbeat: 6000,
      batch_size: 2000,
    }
  )
    .on("change", async (info: any) => {
      // handle change
      console.log("destination change");
      console.log(info);
      await DestinationService.analyzeChangeInfo(info);
      //getDestinationDocsAndMapToEntries();
    })
    .on("paused", function (err: any) {
      //console.log(err);
      console.log("destination paused");
      // replication paused (e.g. replication up to date, user went offline)
    })
    .on("active", function () {
      console.log("destination active");
      // replicate resumed (e.g. new changes replicating, user went back online)
    })
    .on("denied", function (err: any) {
      console.log("destination denied");
      //console.log(err);
      // a document failed to replicate (e.g. due to permissions)
    })
    .on("complete", function (info: any) {
      console.log("destination complete");
      //console.log(info);
      // handle complete
    })
    .on("error", function (err: any) {
      console.log("destination error");
      //console.log(err);
      // handle error
    });
}

@Injectable({
  providedIn: "root",
})
export class DestinationService {
  private static destinationDB = PouchDB("destination");
  static destinationDocs: any = [];
  static filteredDestinations = [];
  static filterObject: any = {};

  private static triggerSubjectForSearch = new Subject<void>();

  static get triggerASearch$(): Observable<void> {
    return DestinationService.triggerSubjectForSearch.asObservable();
  }

  constructor() {}

  static async getDestinationDocs() {
    try {
      DestinationService.destinationDocs =
        await DestinationService.destinationDB
          .allDocs({ include_docs: true })
          .then((result: any) => result.rows.map((row: any) => row.doc));
      console.log("destinationDocs loaded");
    } catch (err) {
      console.log(err);
    }
  }

  static async filterEntriesByLastFilterObject() {
    if (
      DestinationService.filterObject &&
      DestinationService.filterObject.search
    ) {
      console.log("filterEntriesByLastFilterObject");
      await DestinationService.filterEntries(
        DestinationService.filterObject.search
      );
    }
  }

  static async filterEntries(searchTerm: string) {
    DestinationService.filterObject = {
      search: searchTerm,
    };
    if (searchTerm.trim() === "") {
      DestinationService.filteredDestinations = [];
      return;
    }
    //clearTableContent()

    const filteredEntries = DestinationService.destinationDocs.filter(
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

    DestinationService.filteredDestinations = filteredEntries;
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
    console.log("removeDestinationById: " + entity_id);
    DestinationService.destinationDocs =
      DestinationService.destinationDocs.filter(
        (item: any) => !(item._id === entity_id)
      );
  }

  static handleNewEntity(entity_with_only_reference: any) {
    console.log("handleNewDestination: ");
    console.log(entity_with_only_reference);
    DestinationService.destinationDocs.unshift(
      DestinationService.convertEntity(entity_with_only_reference)
    );
  }

  static handleUpdateEntity(entity_with_only_reference: any) {
    console.log("updateDestination: ");
    console.log(entity_with_only_reference);
    const objIndex: number = DestinationService.destinationDocs.findIndex(
      (obj: any) => obj._id == entity_with_only_reference._id
    );
    console.log(objIndex);
    DestinationService.destinationDocs[objIndex] =
      DestinationService.convertEntity(entity_with_only_reference);
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
              DestinationService.removeEntityById(element._id);
            }
          } else {
            if (element._revisions !== undefined) {
              if (element._revisions.start !== undefined) {
                if (element._revisions.start === 1) {
                  DestinationService.handleNewEntity(element);
                } else {
                  DestinationService.handleUpdateEntity(element);
                }
              }
            }
          }
        });
        //await DestinationService.filterEntriesByLastFilterObject();
      }
    }
  }
  /*
  static async createUnknownEntity(
    entity_content: string
  ): Promise<string | null> {
    const content = entity_content.trim();
    const destination: any = DestinationService.destinationDocs.filter(
      (a: any) => {
        if (a.content === content) {
          return a;
        }
      }
    )[0];
    console.log(destination);
    if (destination !== undefined) {
      return destination._id;
    }
    let saveObject: any = {};
    saveObject.content = content;
    saveObject.unknown = true;
    saveObject.drivers = [];
    saveObject._deleted = false;
    saveObject.driversEverExistedWithThisDestination = [];
    let documentResult = await DestinationService.createEntity(saveObject);
    if (documentResult.ok === true) {
      console.log("ID:" + documentResult.id);
      let entityResult = await DestinationService.destinationDB.get(
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
      console.log("createEntity -> Destination");
      console.log(entity);
      let saveObject: any = {};
      saveObject.content = entity.content;
      saveObject.drivers = entity.drivers;
      saveObject._deleted = false;
      let entrydb_post_result = await DestinationService.destinationDB.post(
        saveObject
      );
      if (entrydb_post_result.ok === true) {
        let entity = await DestinationService.destinationDB.get(
          entrydb_post_result.id
        );
        await DestinationService.handleNewEntity(entity);
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
      res = await DestinationService.destinationDB.get(entity._id);
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
      let entrydb_put_result = await DestinationService.destinationDB.put(
        updateObject
      );
      if (entrydb_put_result.ok === true && deleted_flag === false) {
        let entity = await DestinationService.destinationDB.get(
          entrydb_put_result.id
        );
        await DestinationService.handleUpdateEntity(entity);
      } else if (entrydb_put_result.ok === true && deleted_flag === true) {
        await DestinationService.removeEntityById(entrydb_put_result.id);
        await DriverService.remove_destination_from_destinations(entity._id);
      }
    } catch (err) {
      console.log(err);
    }
  }
  /*
  static async autoAddDriver(destinationId: string, driverId: string) {
    let updateNeeded: boolean = false;
    const destination: any = DestinationService.destinationDocs.filter(
      (a: any) => {
        if (a._id === destinationId) {
          return a;
        }
      }
    )[0];
    if (destination) {
      if (destination.driversEverExistedWithThisDestination) {
        if (
          !destination.driversEverExistedWithThisDestination.includes(driverId)
        ) {
          destination.driversEverExistedWithThisDestination.push(driverId);
          updateNeeded = true;
        } else {
          updateNeeded = false;
        }
      } else {
        destination.driversEverExistedWithThisDestination = [];
        destination.driversEverExistedWithThisDestination.push(driverId);
        updateNeeded = true;
      }
      if (updateNeeded) {
        await DestinationService.updateEntity(destination, false);
      }
    }
  }

  static async removedriver_from_driversEverExistedWithThisDestination(
    driverId: string
  ) {
    const destinations_with_driver: any[] =
      DestinationService.destinationDocs.filter((a: any) => {
        if (a.driversEverExistedWithThisDestination.includes(driverId)) {
          return a;
        }
      });
    destinations_with_driver.forEach(async (destination: any) => {
      const filtered_driversEverExistedWithThisDestination: any[] =
        destination.driversEverExistedWithThisDestination.filter((a: any) => {
          if (a !== driverId) {
            return a;
          }
        });
      destination.driversEverExistedWithThisDestination =
        filtered_driversEverExistedWithThisDestination;
      await DestinationService.updateEntity(destination, false);
    });
  }
*/
  static async removedriver_from_drivers(driverId: string) {
    const destinations_with_driver: any[] =
      DestinationService.destinationDocs.filter((a: any) => {
        if (a.drivers.includes(driverId)) {
          return a;
        }
      });
    destinations_with_driver.forEach(async (destination: any) => {
      const filtered_drivers: any[] = destination.drivers.filter((a: any) => {
        if (a !== driverId) {
          return a;
        }
      });
      destination.drivers = filtered_drivers;
      await DestinationService.updateEntity(destination, false);
    });
  }
}
