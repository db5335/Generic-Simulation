import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as prism from 'prismjs';

@Component({
  selector: 'app-pseudocode',
  templateUrl: './pseudocode.component.html',
  styleUrls: ['./pseudocode.component.scss']
})
export class PseudocodeComponent implements OnInit {
  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    let x = document.getElementById('sphericalCode')
    prism.highlightElement(x as any)
  }

  click() {
    console.log('here')
    let x = document.getElementById('sphericalPseudocode')
    x!.setAttribute('data-line', '2')
    console.log(x)
    console.log(document.getElementById('sphericalCode')!.textContent)
    console.log(prism)
    prism.highlightElement(document.getElementById('sphericalCode')!)
    this.changeDetector.detectChanges();
  }
}
