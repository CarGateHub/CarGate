import { NgModule, isDevMode } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { EntrytableComponent } from "./components/entrytable/entrytable.component";
import { EntitySearchAndSelectComponent } from "./components/entity-search-and-select/entity-search-and-select.component";
import { SettingsComponent } from './components/settings/settings.component';
import { SettingsLicensePlateComponent } from './components/settings-license-plate/settings-license-plate.component';
import { SettingsDriverComponent } from './components/settings-driver/settings-driver.component';
import { SettingsDestinationComponent } from './components/settings-destination/settings-destination.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { NewEntryWindowComponent } from './components/new-entry-window/new-entry-window.component';
import { LoginBoxComponent } from './components/login-box/login-box.component';
import { UpdateEntryPopupComponent } from './components/update-entry-popup/update-entry-popup.component';
import { EntryTableNativeComponent } from './components/entry-table-native/entry-table-native.component';

@NgModule({
  declarations: [
    AppComponent,
    EntrytableComponent,
    EntitySearchAndSelectComponent,
    SettingsComponent,
    SettingsLicensePlateComponent,
    SettingsDriverComponent,
    SettingsDestinationComponent,
    NewEntryWindowComponent,
    LoginBoxComponent,
    UpdateEntryPopupComponent,
    EntryTableNativeComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
})],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
