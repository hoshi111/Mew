import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-download-modal',
  templateUrl: './download-modal.component.html',
  styleUrls: ['./download-modal.component.scss'],
})
export class DownloadModalComponent  implements OnInit {
  @Input() state: any;
  
  constructor() { }

  ngOnInit() {
    console.log(this.state)
  }
}
