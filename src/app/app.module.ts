import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {AttachedNotificationModule} from "./attached-notification/attached-notification.module";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AttachedNotificationModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
