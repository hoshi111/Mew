import { Component, Input, OnInit, input } from '@angular/core';

@Component({
  selector: 'app-details-modal',
  templateUrl: './details-modal.component.html',
  styleUrls: ['./details-modal.component.scss'],
})
export class DetailsModalComponent  implements OnInit {
  @Input() public state: any;

  constructor() { }

  ngOnInit() {
    console.log(this.state)
  }

}
