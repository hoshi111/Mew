import { Component } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  public subscription: any = Subscription;
  data: any = [];
  public results = [...this.data];
  query: any;
  movieDetails: any = [];

  constructor(private apiService: ApiService,
              private router: Router
  ) {}

  // ngOnInit() {
  //   console.log(this.query.length)
  // }

  handleInput(e: any) {
    this.query = e.target.value.toLowerCase();
    this.searchKeyword(this.query).then((result: any) => {
      console.log(result.results)
      this.movieDetails = result.results
      // result.results.forEach((item: any) => {
      //   console.log(item)
      // })
    })
  }

  searchKeyword(text: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.searchKeyword(text).subscribe(
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

  getVideo(id: number) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.getSpecificMovie(id).subscribe(
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

    // const link = {
    //   link: 'https://vidsrc.to/embed/movie/' + movieDetail.id
    // }

    // movieDetail.push(link);

    // this.getVideo(movieDetail.id).then((result: any) => {
    //   movieDetail.push(link);
    // })

    const queryParams: any = {};

    queryParams.value = JSON.stringify(movieDetail);

    const navigationExtras: NavigationExtras = {queryParams}

    this.router.navigate(['details'], navigationExtras);
  }

}
