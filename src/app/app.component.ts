import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Energy-Efficient-Simulation';

  constructor(private renderer2: Renderer2, @Inject(DOCUMENT) private _document: any) {}

  ngOnInit() {
    const s = this.renderer2.createElement('script');
    s.type = 'text/javascript';
    // the path to your script inside the assets folder '../assets/yourcode.js'
    s.src = '../assets/prism.js';
    s.text = ``;
    this.renderer2.appendChild(this._document.body, s);
 }
}
