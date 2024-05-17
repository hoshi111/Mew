import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit{
  home_icon: any;
  search_icon: any;
  person_icon: any;
  constructor() { }

  ngOnInit() {
    this.homeActive();
  }

  homeActive() {
    this.home_icon = 'home';
    this.search_icon = 'search-outline';
    this.person_icon = 'person-outline';
  }

  searchActive() {
    this.home_icon = 'home-outline';
    this.search_icon = 'search';
    this.person_icon = 'person-outline';
  }

  profileActive() {
    this.home_icon = 'home-outline';
    this.search_icon = 'search-outline';
    this.person_icon = 'person';
  }

}
