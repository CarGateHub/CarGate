import { Component } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "CarGate";
  databaseConnectionValid: boolean = false;
  databaseConnectionData: string | null | undefined;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("Új verzió érhető el. Szeretnéd betölteni?")) {
          window.location.reload();
        }
      });
    }
    this.checkLogin(true);
  }

  checkLogin(value: boolean) {
    this.databaseConnectionData = localStorage.getItem("app_username");
    if (
      this.databaseConnectionData !== null &&
      this.databaseConnectionData !== undefined
    ) {
      this.databaseConnectionValid = true;
    }
  }
}
