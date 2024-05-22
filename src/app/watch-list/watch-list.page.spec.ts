import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchListPage } from './watch-list.page';

describe('WatchListPage', () => {
  let component: WatchListPage;
  let fixture: ComponentFixture<WatchListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
