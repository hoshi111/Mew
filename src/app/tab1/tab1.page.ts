import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { LoaderService } from 'src/app/api/loader.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit{
  public subscription: any = Subscription;
  list: any = [];
  movieDetails: any = [];
  categories: any = [{name: 'Movies', pressed: true}, 
                     {name: 'TV Shows', pressed: false},
                     {name: 'Episodes', pressed: false},
                      {name: 'Anime', pressed: false}];
  i = 1;
  initial = 'movie';
  isAnime: boolean = false;
  animeResults: any = [];

  constructor(private apiService: ApiService,
              private router: Router,
              private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.generateItems(this.initial);
  }

  generateItems(vid: any) {
    console.log(this.initial)
    this.getList(vid, 'new', this.i).then((result: any) => {
      this.list = result.result.items;
      console.log(this.list)

      if (this.initial === 'movie') {
        this.list.forEach((item: any) => {
          this.getDetail(item.imdb_id).then((result: any) => {
            // console.log(result)
            result.movie_results[0].displayTitle = item.title;
            result.movie_results[0].link = item.embed_url_imdb;
            result.movie_results[0].isAnime = false;
            this.movieDetails.push(result.movie_results[0])
          })
        })
      }

      else if (this.initial === 'tv') {
        this.list.forEach((item: any) => {
          this.getDetail(item.imdb_id).then((result: any) => {
            console.log('result: ', result)
            result.tv_results[0].displayTitle = item.title;
            result.tv_results[0].link = item.embed_url_imdb;
            result.movie_results[0].isAnime = false;
            this.movieDetails.push(result.tv_results[0])
          })
        })
      }

      else {
        this.list.forEach((item: any) => {
          this.getDetail(item.imdb_id).then((result: any) => {
            // console.log(result)
            result.episode_results[0].displayTitle = item.title;
            result.episode_results[0].link = item.embed_url_imdb;
            result.movie_results[0].isAnime = false;
            this.movieDetails.push(result.episode_results[0])
          })
        })
      }
      
      console.log(this.movieDetails)
    })
  }

  onIonInfinite(ev: Event) {
    console.log('true')
    this.i += 1;
    if (!this.isAnime) {
      this.generateItems(this.initial);
    }

    else {
      this.animeRecentEpisodes();
    }
    
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  chooseCat(index:any) {

    this.categories.forEach((category: any) => {
      category.pressed = false;
    });
    index.pressed = !index.pressed;

    if (index.name == 'Movies') {
      this.isAnime = false;
      this.initial = 'movie'
      this.movieDetails = [];
      this.i = 1;
    }

    else if (index.name == 'TV Shows') {
      this.isAnime = false;
      this.initial = 'tv'
      this.movieDetails = [];
      this.i = 1;
    }

    else if (index.name == 'Episodes') {
      this.isAnime = false;
      this.initial = 'episode'
      this.movieDetails = [];
      this.i = 1;
    }

    else if (index.name == 'Anime') {
      this.isAnime = true;
      this.animeResults = [];
      this.movieDetails = [];
      this.i = 1;
      this.animeRecentEpisodes();
      
    }

    if (index.name != 'Anime') {
      this.generateItems(this.initial);
    }
  }

  animeRecentEpisodes() {
    this.animeGetRecent(this.i).then((result: any) => {
      console.log(result)

      result.results.forEach((item: any) => {
        this.animeResults = {
          id: item.id,
          displayTitle: item.title,
          image: item.image,
          link: item.url,
          isAnime: true
        }

        this.movieDetails.push(this.animeResults)
      })

      console.log(this.movieDetails)
    })

    
  }

  getList(vid: string, type: string, page: any) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getLatestMovies(vid, type, page).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  getDetail(id: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getDetail(id).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  animeGetRecent(page: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimeRecentEp(page).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  showDetailsPage(movieDetail: any) {
    console.log(movieDetail)
    const queryParams: any = {};

    queryParams.value = JSON.stringify(movieDetail);

    const navigationExtras: NavigationExtras = {queryParams}

    this.router.navigate(['details'], navigationExtras);
  }
}
