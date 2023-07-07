import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { DestinationService } from "./destination.service";
import { DriverService } from "./driver.service";
import { LicensePlateService } from "./license-plate.service";
const PouchDB = require("pouchdb").default;
PouchDB.plugin(require("pouchdb-find").default);
if (localStorage.getItem("app_username") !== null) {
  const sync_entry = PouchDB.sync(
    "entry",
    "https://" +
      localStorage.getItem("app_username") +
      ":" +
      localStorage.getItem("app_password") +
      "@" +
      localStorage.getItem("app_hostandport") +
      "/entry",
    {
      live: true,
      retry: true,

      heartbeat: 6000,
      batch_size: 10000,
    }
  )
    .on("change", async (info: any) => {
      // handle change
      console.log("entry change");
      console.log(info);

      await EntryService.analyzeChangeInfo(info);
    })
    .on("paused", function (err: any) {
      //console.log(err);
      console.log("entry paused");
      // replication paused (e.g. replication up to date, user went offline)
    })
    .on("active", function () {
      console.log("entry active");
      // replicate resumed (e.g. new changes replicating, user went back online)
    })
    .on("denied", function (err: any) {
      console.log("entry denied");
      //console.log(err);
      // a document failed to replicate (e.g. due to permissions)
    })
    .on("complete", function (info: any) {
      console.log("entry complete");
      //console.log(info);
      // handle complete
    })
    .on("error", function (err: any) {
      console.log("entry error");
      //console.log(err);
      // handle error
    });
}

@Injectable({
  providedIn: "root",
})
export class EntryService {
  private static entryDB = PouchDB("entry");

  static entryDocs: any = [];
  static filteredEntries = [];
  static filterObject: any = {};
  private static triggerSubjectForSearch = new Subject<void>();

  static get triggerASearch$(): Observable<void> {
    return EntryService.triggerSubjectForSearch.asObservable();
  }

  constructor(
    private licensePlateService: LicensePlateService,
    private driverService: DriverService,
    private destinationService: DestinationService
  ) {}

  static async getEntryDocs() {
    try {
      EntryService.entryDocs = await EntryService.entryDB
        .allDocs({ include_docs: true })
        .then((result: any) => result.rows.map((row: any) => row.doc));

      /*
      await EntryService.entryDB
        .allDocs({ include_docs: true })
        .then((result: any) => {
          console.log(result);
        });
      */
      /*
      let dateOfPrevieous3Month = new Date();
      let epochOfPrevieous3Month = Number(
        Math.round(dateOfPrevieous3Month.getTime() / 1000 - 3 * 2629743)
      );

      let result = await EntryService.entryDB.find({
        selector: {
          time: {
            $gte: epochOfPrevieous3Month,
          },
        },
      });
      EntryService.entryDocs = result.docs;
*/
      //console.log(EntryService.entryDocs);
      // sort the filtered entries by time in ascending order

      EntryService.entryDocs = EntryService.entryDocs.sort((a: any, b: any) => {
        return b.time - a.time;
      });
      console.log("entryDocs loaded");
      //console.log(EntryService.entryDocs);
    } catch (err) {
      console.log(err);
    }
  }

  static async removeOldEntries() {
    const current_Time = new Date();
    EntryService.entryDocs.forEach(async (entry: any) => {
      if (current_Time.getTime() - entry.time > 9000000000) {
        try {
          var response = await EntryService.entryDB.remove(
            entry._id,
            entry._rev
          );
        } catch (err) {
          console.log(err);
        }
      }
    });
  }

  static mapLicensePlatesToEntries() {
    EntryService.entryDocs.forEach((entry: any) => {
      const licensePlate = LicensePlateService.licensePlateDocs.find(
        (lp: any) =>
          lp._id === entry.license_plate || lp._id === entry.license_plate._id
      );
      if (licensePlate) {
        entry.license_plate = licensePlate;
      }
    });
  }

  static mapDriversToEntries() {
    EntryService.entryDocs.forEach((entry: any) => {
      const driver = DriverService.driverDocs.find(
        (d: any) => d._id === entry.driver || d._id === entry.driver._id
      );
      if (driver) {
        entry.driver = driver;
      }
    });
  }

  static mapDestinationsToEntries() {
    EntryService.entryDocs.forEach((entry: any) => {
      const destination = DestinationService.destinationDocs.find(
        (d: any) =>
          d._id === entry.destination || d._id === entry.destination._id
      );
      if (destination) {
        entry.destination = destination;
      }
    });
  }

  static async filterEntriesByLastFilterObject() {
    setTimeout(async () => {
      if (EntryService.filterObject) {
        console.log("filterEntriesByLastFilterObject");
        await EntryService.filterEntries(
          EntryService.filterObject.search,
          EntryService.filterObject.start_date_,
          EntryService.filterObject.end_date_
        );
      }
      this.triggerSubjectForSearch.next();
    }, 1000);
  }

  static async filterEntries(
    searchTerm: string,
    start_date: string,
    end_date: string
  ) {
    EntryService.filterObject = {
      search: searchTerm,
      start_date_: start_date,
      end_date_: end_date,
    };
    //clearTableContent()

    // define the search term and date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    console.log("before filter");
    EntryService.entryDocs = EntryService.entryDocs.sort((a: any, b: any) => {
      return b.time - a.time;
    });
    const filteredEntries = EntryService.entryDocs
      .filter((entry: any) => {
        if (entry.license_plate !== undefined) {
          //console.log(entry);
          const licensePlateContent = entry.license_plate.content;
          const licensePlateUnknown = entry.license_plate;
          const driverContent = entry.driver.content;
          const driverUnknown = entry.driver;
          const destinationContent = entry.destination.content;
          const destinationUnknown = entry.destination;
          const comment = entry.comment;

          let licensePlateContent_includes = false;
          let licensePlateUnknown_includes = false;
          let driverContent_includes = false;
          let driverUnknown_includes = false;
          let destinationContent_includes = false;
          let destinationUnknown_includes = false;
          let comment_includes = false;

          if (licensePlateUnknown !== undefined) {
            if (typeof licensePlateUnknown === "string") {
              licensePlateUnknown_includes =
                licensePlateUnknown.includes(searchTerm);
            } else {
              if (licensePlateContent !== undefined) {
                licensePlateContent_includes =
                  licensePlateContent.includes(searchTerm);
              }
            }
          }

          if (driverUnknown !== undefined) {
            if (typeof driverUnknown === "string") {
              driverUnknown_includes = driverUnknown.includes(searchTerm);
            } else {
              if (driverContent !== undefined) {
                driverContent_includes = driverContent.includes(searchTerm);
              }
            }
          }

          if (destinationUnknown !== undefined) {
            if (typeof destinationUnknown === "string") {
              destinationUnknown_includes =
                destinationUnknown.includes(searchTerm);
            } else {
              if (destinationContent !== undefined) {
                destinationContent_includes =
                  destinationContent.includes(searchTerm);
              }
            }
          }
          if (comment !== undefined) {
            comment_includes = comment.includes(searchTerm);
          }

          return (
            (licensePlateContent_includes ||
              licensePlateUnknown_includes ||
              driverContent_includes ||
              driverUnknown_includes ||
              destinationContent_includes ||
              destinationUnknown_includes ||
              comment_includes) &&
            entry.time >= startDate.valueOf() &&
            entry.time <= endDate.valueOf()
          );
        }
        return;
      })
      .slice(0, 100);

    EntryService.filteredEntries = filteredEntries;
  }

  static resolveReferenceForEntry(entry_with_only_reference: any): any {
    let licensePlate_ = LicensePlateService.licensePlateDocs.find(
      (lp: any) => lp._id === entry_with_only_reference.license_plate
    );
    let driver_ = DriverService.driverDocs.find(
      (d: any) => d._id === entry_with_only_reference.driver
    );
    let destination_ = DestinationService.destinationDocs.find(
      (d: any) => d._id === entry_with_only_reference.destination
    );

    console.log(
      "resolveReferenceForEntry",
      licensePlate_,
      driver_,
      destination_
    );

    if (licensePlate_ === undefined) {
      licensePlate_ = entry_with_only_reference.license_plate;
    }
    if (driver_ === undefined) {
      driver_ = entry_with_only_reference.driver;
    }
    if (destination_ === undefined) {
      destination_ = entry_with_only_reference.destination;
    }
    const ret = {
      time: entry_with_only_reference.time,
      comment: entry_with_only_reference.comment,
      direction: entry_with_only_reference.direction,
      porta: entry_with_only_reference.porta,
      license_plate: licensePlate_,
      driver: driver_,
      destination: destination_,
      _id: entry_with_only_reference._id,
      _rev: entry_with_only_reference._rev,
    };
    return ret;
  }

  static async removeEntryById(entry_id: any) {
    console.log("removeEntryById: " + entry_id);
    EntryService.entryDocs = EntryService.entryDocs.filter(
      (item: any) => !(item._id === entry_id)
    );
    await EntryService.filterEntriesByLastFilterObject();
  }

  static async handleNewEntry(entry_with_only_reference: any) {
    console.log("handleNewEntry: ", entry_with_only_reference);
    console.log(
      "resolved references:",
      EntryService.resolveReferenceForEntry(entry_with_only_reference)
    );

    EntryService.entryDocs.unshift(
      EntryService.resolveReferenceForEntry(entry_with_only_reference)
    );
    await EntryService.filterEntriesByLastFilterObject();
  }

  static async updateEntry(entry_with_only_reference: any) {
    console.log("updateEntry: ");
    console.log(entry_with_only_reference);
    const objIndex: number = EntryService.entryDocs.findIndex(
      (obj: any) => obj._id == entry_with_only_reference._id
    );
    console.log(objIndex);
    EntryService.entryDocs[objIndex] = EntryService.resolveReferenceForEntry(
      entry_with_only_reference
    );
    await EntryService.filterEntriesByLastFilterObject();
  }

  static async analyzeChangeInfo(info: any) {
    console.log("analyzeChangeInfo");
    if (
      info &&
      info.direction &&
      info.direction === "pull" /*||
      info.direction ===
        "push" this can not work if the database connection is not working*/
    ) {
      if (info.change && info.change.docs && Array.isArray(info.change.docs)) {
        info.change.docs.forEach(async (element: any) => {
          if (element._deleted !== undefined) {
            if (element._deleted === true) {
              await EntryService.removeEntryById(element._id);
            }
          } else {
            if (element._revisions !== undefined) {
              if (element._revisions.start !== undefined) {
                if (element._revisions.start === 1) {
                  await EntryService.handleNewEntry(element);
                } else {
                  await EntryService.updateEntry(element);
                }
              }
            }
          }
        });
        await EntryService.filterEntriesByLastFilterObject();
      }
    }
  }

  static async createNewEntry(
    licensePlate: string,
    driver: string,
    destination: string,
    direction: string,
    porta: string,
    comment: string
  ) {
    try {
      console.log("createNewEntry");

      const initDate = new Date();
      const epochTime = initDate.getTime() / 1000;
      var dateToGetRealTime = new Date(0);
      dateToGetRealTime.setUTCSeconds(epochTime);

      let entrydb_post_result = await EntryService.entryDB.post({
        time: dateToGetRealTime.getTime(),
        comment: comment,
        porta: porta,
        direction: direction,
        license_plate: licensePlate,
        driver: driver,
        destination: destination,
      });

      console.log("entrydb_post_result:", entrydb_post_result);
      if (entrydb_post_result.ok === true) {
        let entity = await EntryService.entryDB.get(entrydb_post_result.id);
        await EntryService.handleNewEntry(entity);
      }
      //console.log(entrydb_post_result);
      /*
      setTimeout(async () => {
        let result = await LicensePlateService.autoAddDriver(
          licensePlateId,
          driverId
        );
        console.log(result);
        result = await DriverService.autoAddLicensePlateAndDestination(
          driverId,
          licensePlateId,
          destinationId
        );
        console.log(result);
        result = await DestinationService.autoAddDriver(
          destinationId,
          driverId
        );
        console.log(result);
      }, 1000);
      */
    } catch (err) {
      console.log(err);
    }
  }

  static async updateEntity(entity: any, deleted_flag: boolean) {
    let res;
    try {
      res = await EntryService.entryDB.get(entity._id);
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
    console.log(entity.time);
    updateObject.time = entity.time;

    updateObject.comment = entity.comment;
    updateObject.porta = entity.porta;
    updateObject.direction = entity.direction;
    updateObject.license_plate = res.license_plate;
    updateObject.driver = res.driver;
    updateObject.destination = res.destination;

    if (deleted_flag) {
      updateObject._deleted = deleted_flag;
    }
    try {
      var entrydb_put_result = await EntryService.entryDB.put(updateObject);
      console.log("updateEntity", entrydb_put_result);
      if (entrydb_put_result.ok === true && deleted_flag === false) {
        let entity = await EntryService.entryDB.get(entrydb_put_result.id);
        await EntryService.updateEntry(entity);
      } else if (entrydb_put_result.ok === true && deleted_flag === true) {
        await EntryService.removeEntryById(entrydb_put_result.id);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
