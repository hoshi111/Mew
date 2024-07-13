import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LoaderService } from '../api/loader.service';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.page.html',
  styleUrls: ['./reader.page.scss'],
})
export class ReaderPage implements OnInit {
  public subscription: any = Subscription;
  localstorage = localStorage;

  title: any = '';
  pages: any;
  chapters: any;
  index = 0;
  currentId: string = '';
  value: any;

  constructor(private apiService: ApiService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loaderService.showLoader();
    this.loadPages();
  }
 
  loadPages() {
    if (!this.currentId) {
      this.value = this.activatedRoute.snapshot.queryParamMap.get('value');
    }

    else {
      this.value = '"' + this.currentId + '"';
    }
    console.log(this.value)
    this.mangaInfo(this.localstorage.getItem('mangaId')).then((result: any) => {

      this.chapters = result.chapters;

      for (let i = 0; i < this.chapters.length; i ++) {
        if(this.value == '"' + this.chapters[i].id + '"') {
          this.index = i;
          this.title = this.chapters[i].title;

          this.getPages(this.chapters[i].id).then((data: any) => {
            console.log(data)
            
            this.pages = data;

            this.pages.forEach((page: any) => {
              page.img = 'https://zjcdn.mangahere.cc' + page.img.slice(27);
            })
          }).then(() => {
            this.loaderService.hideLoader();
          })
        }
      }

      // this.chapters.forEach((chapter: any) => {
      //   if(value == '"' + chapter.id + '"') {
      //     this.title = chapter.title

      //     this.getPages(chapter.id).then((data: any) => {
      //       console.log(data)
            
      //       this.pages = data;

      //       this.pages.forEach((page: any) => {
      //         page.img = 'https://zjcdn.mangahere.cc' + page.img.slice(27);
      //       })
      //     })
      //   }
      // })
    })

    
  }

  nextChapter() {
    this.loaderService.showLoader();
    const nextChapterId = this.chapters[this.index + 1].id;

    const queryParams: any = {};

    queryParams.value = JSON.stringify(nextChapterId);

    let navigationExtras: NavigationExtras = {};

    navigationExtras = {queryParams};

    this.router.navigate(['reader'], navigationExtras);
    this.currentId = nextChapterId;
    this.loadPages();
  }

  close() {
    this.router.navigate(['tabs/search']);
  }

  mangaInfo(id: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.mangaInfo(id).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  getPages(id: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.mangaGetPages(id).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

}
