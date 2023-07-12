import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { of, Subscription } from "rxjs";
import { EntitySearchAndSelectComponent } from "../../components/entity-search-and-select/entity-search-and-select.component";
import { EntrytableComponent } from "../../components/entrytable/entrytable.component";
import { DestinationService } from "../../services/destination.service";
import { DriverService } from "../../services/driver.service";
import { EntryService } from "../../services/entry.service";
import { LicensePlateService } from "../../services/license-plate.service";
import { UpdateEntryPopupComponent } from "../update-entry-popup/update-entry-popup.component";
import * as XLSX from "xlsx";
import { MessageSenderService } from "src/app/services/message-sender.service";

@Component({
  selector: "app-new-entry-window",
  templateUrl: "./new-entry-window.component.html",
  styleUrls: ["./new-entry-window.component.css"],
})
export class NewEntryWindowComponent {
  subscriptionToTriggerASearch: Subscription | undefined;
  subscriptionToTriggerASearchLicensePlate: Subscription | undefined;
  subscriptionToTriggerASearchDriver: Subscription | undefined;
  subscriptionToTriggerASearchDestination: Subscription | undefined;

  readyToUse = false;
  commentTxt: string = "";
  searchTxt: string = "";
  timeout: any = null;
  selectedEntries: boolean = false;

  yesterday: string = "";
  tomorrow: string = "";

  @ViewChild("licensePlateSearchAndSelect")
  licensePlateSearchAndSelectComponent!: EntitySearchAndSelectComponent;
  @ViewChild("driverSearchAndSelect")
  driverSearchAndSelectComponent!: EntitySearchAndSelectComponent;
  @ViewChild("destinationSearchAndSelect")
  destinationSearchAndSelectComponent!: EntitySearchAndSelectComponent;

  @ViewChild("entrytable")
  entrytable!: EntrytableComponent;

  @ViewChild("porta1RadioButton")
  porta1RadioButton!: any;

  @ViewChild("porta2RadioButton")
  porta2RadioButton!: any;
  @ViewChild("loading_screen")
  loading_screen!: any;

  @ViewChild("newEntryContainer")
  newEntryContainer!: any;

  @ViewChild("newEntryButtonIn")
  newEntryButtonIn!: any;

  @ViewChild("newEntryButtonOut")
  newEntryButtonOut!: any;

  @ViewChild("settings_screen")
  settings_screen!: any;
  settings_screen_on: boolean = true;

  openAndCloseSettings() {
    if (this.settings_screen_on) {
      let password = prompt("Kérem a jelszót", "");
      if (password != null) {
        if (password === "alma") {
          this.settings_screen.nativeElement.style = "display:block";
          this.settings_screen_on = false;
        }
      }
    } else {
      this.settings_screen.nativeElement.style = "display:none";
      this.settings_screen_on = true;
    }
  }

  @ViewChild("update_popup_screen")
  update_popup_screen!: any;
  update_popup_screen_on: boolean = false;

  @ViewChild("update_entry_container")
  update_entry_container!: UpdateEntryPopupComponent;

  portaRadioButtonChecked: string | null = "";
  porta1RadioButtonIsChecked: boolean = true;

  autoSuggestionChecked: string | null = "";
  autoSuggestioncheckboxChecked: boolean = false;
  groupEntryChecked: boolean = false;

  constructor(
    public licensePlateService: LicensePlateService,
    public destinationService: DestinationService,
    public driverService: DriverService,
    public entryService: EntryService,
    public messageSenderService: MessageSenderService,
    private cdr: ChangeDetectorRef
  ) {
    let y = new Date();
    y.setDate(y.getDate() - 1);
    this.yesterday = y.toISOString().substring(0, 10);

    // get tomorrow's date by adding one day
    let t = new Date();
    t.setDate(t.getDate() + 1);
    this.tomorrow = t.toISOString().substring(0, 10);
  }

  async ngOnInit() {
    await this.initServices();
    this.subscriptionToTriggerASearch = EntryService.triggerASearch$.subscribe(
      () => {
        this.filterEntries();
      }
    );

    this.subscriptionToTriggerASearchLicensePlate =
      LicensePlateService.triggerASearch$.subscribe(() => {
        EntryService.mapLicensePlatesToEntries();
        this.triggerSearch();
      });
    this.subscriptionToTriggerASearchDriver =
      DriverService.triggerASearch$.subscribe(() => {
        EntryService.mapDriversToEntries();
        this.triggerSearch();
      });
    this.subscriptionToTriggerASearchDestination =
      DestinationService.triggerASearch$.subscribe(() => {
        EntryService.mapDestinationsToEntries();
        this.triggerSearch();
      });

    this.portaRadioButtonChecked = localStorage.getItem("selectedPorta");
    if (this.portaRadioButtonChecked === null) {
      this.portaRadioButtonChecked = "1.";
      localStorage.setItem("selectedPorta", this.portaRadioButtonChecked);
      this.porta1RadioButtonIsChecked = true;
    } else {
      if (this.portaRadioButtonChecked.trim() === "1.") {
        this.porta1RadioButtonIsChecked = true;
      } else {
        this.porta1RadioButtonIsChecked = false;
      }
    }

    this.autoSuggestionChecked = localStorage.getItem("suggestionMode");
    if (this.autoSuggestionChecked === null) {
      this.autoSuggestionChecked = "false";
      this.autoSuggestioncheckboxChecked = false;
      localStorage.setItem("suggestionMode", this.autoSuggestionChecked);
    } else {
      if (this.autoSuggestionChecked.trim() === "false") {
        this.autoSuggestioncheckboxChecked = false;
      } else {
        this.autoSuggestioncheckboxChecked = true;
      }
    }
    this.newEntryButtonIn.nativeElement.disabled = true;
    this.newEntryButtonOut.nativeElement.disabled = true;
    if (this.porta1RadioButtonIsChecked === false) {
      await EntryService.removeOldEntries();
      this.messageSenderService.SendMessage("Port 2 reloaded the window");
    } else {
      this.messageSenderService.SendMessage("Port 1 reloaded the window");
    }
  }

  ngAfterViewInit() {
    window.addEventListener("keydown", function (e) {
      if (e.key === "f" && e.ctrlKey === true) {
        this.window.document.getElementById("entrySearchBar")?.focus();
        e.preventDefault();
      }
    });
  }

  DriverService_filteredDrivers() {
    return DriverService.filteredDrivers;
  }

  LicensePlateService_filteredLicensePlates() {
    return LicensePlateService.filteredLicensePlates;
  }

  DestinationService_filteredDestinations() {
    return DestinationService.filteredDestinations;
  }

  EntryService_filteredEntries() {
    return EntryService.filteredEntries;
  }

  async initServices() {
    await LicensePlateService.getLicensePlateDocs();
    await DriverService.getDriverDocs();
    await DestinationService.getDestinationDocs();
    await EntryService.getEntryDocs();

    EntryService.mapLicensePlatesToEntries();
    EntryService.mapDriversToEntries();
    EntryService.mapDestinationsToEntries();
    await this.triggerSearch();
    this.readyToUse = true;
    console.log("Services are ready to use");
    this.loading_screen.nativeElement.style = "display:none";
    this.newEntryContainer.nativeElement.style = "display:block";
  }

  triggerSearch() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(async () => {
      await this.filterEntries();
    }, 1000);
  }

  async filterEntries() {
    await EntryService.filterEntries(
      this.searchTxt,
      "2023-01-01",
      "2028-08-20"
    );
    //this.entrytable.clearEntriesArray();
    this.entrytable.setEntriesArray(EntryService.filteredEntries);
    //this.cdr.detectChanges();
  }

  async filterForLicensePlates(searchTxt: string) {
    await LicensePlateService.filterEntries(searchTxt);

    this.licensePlateSearchAndSelectComponent.clearSelectedEntry();
    if (this.groupEntryChecked === false) {
      this.driverSearchAndSelectComponent.clearSelectedEntry();
      this.destinationSearchAndSelectComponent.clearSelectedEntry();
      this.driverSearchAndSelectComponent.clearSearchText();
      this.destinationSearchAndSelectComponent.clearSearchText();
    }

    this.selectedEntries = false;
    this.newEntryButtonIn.nativeElement.disabled = true;
    this.newEntryButtonOut.nativeElement.disabled = true;
    this.licensePlateSearchAndSelectComponent.setEntityArray(
      LicensePlateService.filteredLicensePlates
    );
  }
  async selectedLicensePlate(licensePlateId: string) {
    if (this.groupEntryChecked === false) {
      this.driverSearchAndSelectComponent.clearSelectedEntry();
      this.destinationSearchAndSelectComponent.clearSelectedEntry();

      this.driverSearchAndSelectComponent.clearSearchText();
      this.destinationSearchAndSelectComponent.clearSearchText();

      this.selectedEntries = false;
      this.newEntryButtonIn.nativeElement.disabled = true;
      this.newEntryButtonOut.nativeElement.disabled = true;
    } else {
      if (
        (this.driverSearchAndSelectComponent.selectedEntry !== undefined ||
          this.driverSearchAndSelectComponent.unknownEntity) &&
        (this.destinationSearchAndSelectComponent.selectedEntry !== undefined ||
          this.destinationSearchAndSelectComponent.unknownEntity)
      ) {
        this.selectedEntries = true;
        this.newEntryButtonIn.nativeElement.disabled = false;
        this.newEntryButtonOut.nativeElement.disabled = false;
      }
    }

    const licensePlate: any = LicensePlateService.licensePlateDocs.filter(
      (a: any) => {
        if (a._id === licensePlateId) {
          return a;
        }
      }
    )[0];
    if (licensePlate !== undefined) {
      var drivers: any = [];
      if (!this.autoSuggestioncheckboxChecked) {
        licensePlate.drivers.forEach((driverIdElement: string) => {
          const driver: any = DriverService.driverDocs.filter((a: any) => {
            if (a._id === driverIdElement) {
              return a;
            }
          })[0];
          if (driver !== undefined) {
            drivers.push(driver);
          }
        });
      } else {
        console.log(licensePlate);
        licensePlate.driversEverExistedWithThisLicensePlate.forEach(
          (driverIdElement: string) => {
            const driver: any = DriverService.driverDocs.filter((a: any) => {
              if (a._id === driverIdElement) {
                return a;
              }
            })[0];
            if (driver !== undefined) {
              drivers.push(driver);
            }
          }
        );
      }
      if (this.groupEntryChecked === false) {
        this.driverSearchAndSelectComponent.setEntityArray(drivers);
      }
    }
  }
  async filterForDrivers(searchTxt: string) {
    DriverService.filterEntries(searchTxt);
    this.driverSearchAndSelectComponent.clearSelectedEntry();
    this.destinationSearchAndSelectComponent.clearSelectedEntry();
    this.selectedEntries = false;
    this.newEntryButtonIn.nativeElement.disabled = true;
    this.newEntryButtonOut.nativeElement.disabled = true;

    this.destinationSearchAndSelectComponent.clearSearchText();
    this.driverSearchAndSelectComponent.setEntityArray(
      DriverService.filteredDrivers
    );
  }

  async selectedDriver(driverId: string) {
    this.destinationSearchAndSelectComponent.clearSelectedEntry();
    this.destinationSearchAndSelectComponent.clearSearchText();
    this.selectedEntries = false;
    this.newEntryButtonIn.nativeElement.disabled = true;
    this.newEntryButtonOut.nativeElement.disabled = true;

    const driver: any = DriverService.driverDocs.filter((a: any) => {
      if (a._id === driverId) {
        return a;
      }
    })[0];
    if (driver !== undefined) {
      var destinations: any = [];
      if (!this.autoSuggestioncheckboxChecked) {
        driver.destinations.forEach((destinationIdElement: string) => {
          const destination: any = DestinationService.destinationDocs.filter(
            (a: any) => {
              if (a._id === destinationIdElement) {
                return a;
              }
            }
          )[0];
          if (destination !== undefined) {
            destinations.push(destination);
          }
        });
      } else {
        console.log(driver);
        if (
          driver !== undefined &&
          driver.destinationsEverExistedForThisDriver !== undefined
        ) {
          driver.destinationsEverExistedForThisDriver.forEach(
            (destinationIdElement: string) => {
              const destination: any =
                DestinationService.destinationDocs.filter((a: any) => {
                  if (a._id === destinationIdElement) {
                    return a;
                  }
                })[0];
              if (destination !== undefined) {
                destinations.push(destination);
              }
            }
          );
        }
      }
      this.destinationSearchAndSelectComponent.setEntityArray(destinations);
    }
  }

  async filterForDestinations(searchTxt: string) {
    DestinationService.filterEntries(searchTxt);
    this.destinationSearchAndSelectComponent.clearSelectedEntry();
    this.selectedEntries = false;
    this.newEntryButtonIn.nativeElement.disabled = true;
    this.newEntryButtonOut.nativeElement.disabled = true;
    this.destinationSearchAndSelectComponent.setEntityArray(
      DestinationService.filteredDestinations
    );
  }

  selectedDestination(destinationId: string) {
    console.log("selectedDestination");
    if (
      (this.licensePlateSearchAndSelectComponent.selectedEntry ||
        this.licensePlateSearchAndSelectComponent.unknownEntity) &&
      (this.driverSearchAndSelectComponent.selectedEntry ||
        this.driverSearchAndSelectComponent.unknownEntity)
    ) {
      this.selectedEntries = true;
      this.newEntryButtonIn.nativeElement.disabled = false;
      this.newEntryButtonOut.nativeElement.disabled = false;
    }
  }

  groupEntryCheckboxChanged() {
    console.log("groupEntryCheckboxChanged", this.groupEntryChecked);
    if (this.groupEntryChecked === false) {
      this.licensePlateSearchAndSelectComponent.clearSelectedEntry();
      this.driverSearchAndSelectComponent.clearSelectedEntry();
      this.destinationSearchAndSelectComponent.clearSelectedEntry();
      this.selectedEntries = false;
      this.newEntryButtonIn.nativeElement.disabled = true;
      this.newEntryButtonOut.nativeElement.disabled = true;
      this.licensePlateSearchAndSelectComponent.clearSearchText();
      this.driverSearchAndSelectComponent.clearSearchText();
      this.destinationSearchAndSelectComponent.clearSearchText();
    }
  }

  portaRadioButtonChanged() {
    const porta: string = this.porta1RadioButton.nativeElement.checked
      ? "1."
      : "2.";
    localStorage.setItem("selectedPorta", porta);
  }

  async createNewEntry(direction: string) {
    const porta: string = this.porta1RadioButton.nativeElement.checked
      ? "1."
      : "2.";
    let LicensePlateEntityId_or_unknownContent: string | null = null;
    let DriverEntityId_or_unknownContent: string | null = null;
    let DestinationEntityId_or_unknownContent: string | null = null;

    if (this.licensePlateSearchAndSelectComponent.unknownEntity) {
      console.log("unknown license plate");
      console.log(this.licensePlateSearchAndSelectComponent.unknownEntity);
      LicensePlateEntityId_or_unknownContent =
        this.licensePlateSearchAndSelectComponent.unknownEntity;
    }
    if (this.driverSearchAndSelectComponent.unknownEntity) {
      console.log("unknown driver");
      console.log(this.driverSearchAndSelectComponent.unknownEntity);
      DriverEntityId_or_unknownContent =
        this.driverSearchAndSelectComponent.unknownEntity;
    }
    if (this.destinationSearchAndSelectComponent.unknownEntity) {
      console.log("unknown destination");
      console.log(this.destinationSearchAndSelectComponent.unknownEntity);
      DestinationEntityId_or_unknownContent =
        this.destinationSearchAndSelectComponent.unknownEntity;
    }

    if (LicensePlateEntityId_or_unknownContent === null) {
      if (
        this.licensePlateSearchAndSelectComponent.selectedEntry._id ===
        undefined
      ) {
        throw new Error(
          "Can not create Entry because of the undefined license plate"
        );
      } else {
        LicensePlateEntityId_or_unknownContent =
          this.licensePlateSearchAndSelectComponent.selectedEntry._id;
      }
    }

    if (DriverEntityId_or_unknownContent === null) {
      if (this.driverSearchAndSelectComponent.selectedEntry._id === undefined) {
        throw new Error("Can not create Entry because of the undefined driver");
      } else {
        DriverEntityId_or_unknownContent =
          this.driverSearchAndSelectComponent.selectedEntry._id;
      }
    }

    if (DestinationEntityId_or_unknownContent === null) {
      if (
        this.destinationSearchAndSelectComponent.selectedEntry._id === undefined
      ) {
        throw new Error(
          "Can not create Entry because of the undefined destination"
        );
      } else {
        DestinationEntityId_or_unknownContent =
          this.destinationSearchAndSelectComponent.selectedEntry._id;
      }
    }

    if (
      LicensePlateEntityId_or_unknownContent &&
      DriverEntityId_or_unknownContent &&
      DestinationEntityId_or_unknownContent
    ) {
      console.log(LicensePlateEntityId_or_unknownContent);
      console.log(DriverEntityId_or_unknownContent);
      console.log(DestinationEntityId_or_unknownContent);
      await EntryService.createNewEntry(
        LicensePlateEntityId_or_unknownContent,
        DriverEntityId_or_unknownContent,
        DestinationEntityId_or_unknownContent,
        direction,
        porta,
        this.commentTxt
      );
      this.commentTxt = "";
    } else {
      throw new Error("Something impossible happened");
    }

    this.licensePlateSearchAndSelectComponent.clearSelectedEntry();
    if (this.groupEntryChecked === false) {
      this.driverSearchAndSelectComponent.clearSelectedEntry();
      this.destinationSearchAndSelectComponent.clearSelectedEntry();
      this.driverSearchAndSelectComponent.clearSearchText();
      this.destinationSearchAndSelectComponent.clearSearchText();
    }
    this.selectedEntries = false;
    this.newEntryButtonIn.nativeElement.disabled = true;
    this.newEntryButtonOut.nativeElement.disabled = true;
    this.licensePlateSearchAndSelectComponent.clearSearchText();
  }

  quickSelect(entry: any) {
    console.log("quickSelect", entry);

    if (typeof entry.license_plate !== "string") {
      this.licensePlateSearchAndSelectComponent.searchTxt =
        entry.license_plate.content;
      this.licensePlateSearchAndSelectComponent.entityArray = [];
      this.licensePlateSearchAndSelectComponent.entityArray.push(
        entry.license_plate
      );
      this.licensePlateSearchAndSelectComponent.selectEntry(
        entry.license_plate
      );
    } else {
      this.licensePlateSearchAndSelectComponent.entityArray = [];
      this.licensePlateSearchAndSelectComponent.searchTxt = entry.license_plate;
      this.licensePlateSearchAndSelectComponent.selectUnknownEntry(
        entry.license_plate
      );
    }
    if (typeof entry.driver !== "string") {
      this.driverSearchAndSelectComponent.searchTxt = entry.driver.content;
      this.driverSearchAndSelectComponent.entityArray = [];
      this.driverSearchAndSelectComponent.entityArray.push(entry.driver);
      this.driverSearchAndSelectComponent.selectEntry(entry.driver);
    } else {
      this.driverSearchAndSelectComponent.entityArray = [];
      this.driverSearchAndSelectComponent.searchTxt = entry.driver;
      this.driverSearchAndSelectComponent.selectUnknownEntry(entry.driver);
    }

    if (typeof entry.destination !== "string") {
      this.destinationSearchAndSelectComponent.searchTxt =
        entry.destination.content;
      this.destinationSearchAndSelectComponent.entityArray = [];
      this.destinationSearchAndSelectComponent.entityArray.push(
        entry.destination
      );
      this.destinationSearchAndSelectComponent.selectEntry(entry.destination);
    } else {
      this.destinationSearchAndSelectComponent.entityArray = [];
      this.destinationSearchAndSelectComponent.searchTxt = entry.destination;
      this.destinationSearchAndSelectComponent.selectUnknownEntry(
        entry.destination
      );
    }
    this.newEntryButtonIn.nativeElement.disabled = false;
    this.newEntryButtonOut.nativeElement.disabled = false;
  }

  editEntry(entry: any) {
    console.log(entry);
    this.update_popup_screen.nativeElement.style = "display:block";
    this.update_entry_container.setEntryEntity(entry);
  }

  updateEntryEntityResultEventHandler(eventResult: boolean) {
    this.update_popup_screen.nativeElement.style = "display:none";
    //this.update_entry_container.setEntryEntity(undefined);
  }

  flatten(obj: any) {
    return Object.keys(obj).reduce((acc: any, current) => {
      const _key = `${current}`;
      const currentValue = obj[current];
      if (
        Array.isArray(currentValue) ||
        Object(currentValue) === currentValue
      ) {
        Object.assign(acc, this.flatten(currentValue));
      } else {
        acc[_key] = currentValue;
      }
      return acc;
    }, {});
  }
  exportToExcel(): void {
    // generate workbook and add the worksheet
    let output: any[] = [];
    EntryService.filteredEntries.forEach((element: any) => {
      output.push({
        datum: new Date(element.time).toLocaleString(),
        rendszam:
          typeof element.license_plate === "string"
            ? element.license_plate
            : element.license_plate.content,
        sofor:
          typeof element.driver === "string"
            ? element.driver
            : element.driver.content,
        kihez:
          typeof element.destination === "string"
            ? element.destination
            : element.destination.content,
        porta: element.porta,
        irany: element.direction,
        megjegyzes: element.comment,
      });
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(output);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // save to file
    XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
    XLSX.writeFile(workbook, "riport.xlsx");
  }
}
