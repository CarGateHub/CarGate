import { Injectable } from "@angular/core";
import axios from "axios";

@Injectable({
  providedIn: "root",
})
export class MessageSenderService {
  constructor() {}

  async SendMessage(message: string) {
    let username = localStorage.getItem("app_username");
    let password = localStorage.getItem("app_password");
    let hostandport = localStorage.getItem("app_hostandport");

    axios
      .post(
        "https://" + hostandport + "/" + "MESSAGE",
        { message: message },
        {
          headers: {
            Authorization: btoa(username + ":" + password),
          },
        }
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
