import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LoaderService } from '../api/loader.service';
import { IonContent } from '@ionic/angular';

import { doc, setDoc, getDocs, collection } from "firebase/firestore"; 
import { db } from "src/environments/environment";
import { GlobalVariable } from '../api/global';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.page.html',
  styleUrls: ['./reader.page.scss'],
})
export class ReaderPage implements OnInit {
  public subscription: any = Subscription;
  localstorage = localStorage;
  @ViewChild(IonContent) content: IonContent | undefined;

  title: any = '';
  pages: any;
  chapters: any;
  index = 0;
  currentId: string = '';
  value: any;
  uid: any;

  constructor(private apiService: ApiService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private loaderService: LoaderService,
              public global: GlobalVariable
  ) { }

  ngOnInit() {
    this.uid = this.localstorage.getItem('uid');
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
    this.mangaInfo(this.global.data.id).then((result: any) => {

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
    }).then(() => {
      this.saveDb();
      if (!this.currentId) {
        this.content?.scrollToTop(0);
      }
    })

    
  }

  async saveDb() {
    if (this.uid) {
      let id = this.chapters[this.index].id.split('/').join('*');
      id = '0_manga-' + id;
      console.log(this.title)
      await setDoc(doc(db, this.uid, id), {
          details: {
              title: this.title,
              id: id,
              chapterIndex: this.index,
              opened: true,
              mangaId: this.localstorage.getItem('mangaId')
          }
      })
      console.log(id.includes('1_manga-'))
      
  } 
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
    this.router.navigate(['watch-list']);
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
