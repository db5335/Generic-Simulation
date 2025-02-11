import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GraphComponent } from './components/graph/graph.component';
import { PseudocodeComponent } from './components/pseudocode/pseudocode.component';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    PseudocodeComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
