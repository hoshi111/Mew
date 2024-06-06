import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { throwError } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class ApiService {
    constructor(public http: HttpClient){}

    throwError(error: any) {
        console.error(error);
        return throwError(error || 'Server Error')
    }

    getLatestMovies(vid: any, type: any, page: any) {
        return this.http.get('https://vidsrc.to/vapi/' + vid + '/' + type + '/' + page);
    }

    getSpecificMovie(id:number) {
        return this.http.get('https://vidsrc.to/vapi/' + id );
    }

    searchKeyword(text: string) {
        return this.http.get('https://api.themoviedb.org/3/search/movie?query=' + text + '&include_adult=false&language=en-US&page=1', {
            headers: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGViZWFlYmMzNjgyYTI1YTQ0MmFkYTJjYjQ4M2YzNiIsInN1YiI6IjY2NDMwNTU5YzlhODVhYmZiODE4NDUxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXwd_NFZYYnyFuLHu6KHIpspK2DgWidRhUVP3WjTlPI'
            }
        })
    }

    getDetail(id: string) {
        return this.http.get('https://api.themoviedb.org/3/find/' + id + '?external_source=imdb_id', {
            headers: {
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGViZWFlYmMzNjgyYTI1YTQ0MmFkYTJjYjQ4M2YzNiIsInN1YiI6IjY2NDMwNTU5YzlhODVhYmZiODE4NDUxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXwd_NFZYYnyFuLHu6KHIpspK2DgWidRhUVP3WjTlPI'
            }
        })
    }

    animeRecentEp(page: number) {
        return this.http.get(environment.api + 'recent-episodes?page=' + page);
    }

    animeTopAiring(page: number) {
        return this.http.get(environment.api + 'top-airing?page=' + page)
    }

    searchAnime(query: string, page: number) {
        return this.http.get(environment.api + query + '?page=' + page)
    }

    animeGetDetails(query: string) {
        return this.http.get(environment.api + 'info?id=' + query)
    }

    getStreamingLink(id: any) {
        return this.http.get(environment.api + 'watch?episodeId=' + id + '&server=vidcloud')
    }

    gogoAnimePlayVideo(query: any) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/watch/' + query)
    }

    zoroSearch(query: any) {
        return this.http.get('https://consumet-beige.vercel.app/anime/zoro/' + query + '?page=1')
    }

    zoroGetInfo(id: any) {
        return this.http.get('https://consumet-beige.vercel.app/anime/zoro/info?id=' + id)
    }

    zoroGetLink(id: any) {
        return this.http.get('https://consumet-beige.vercel.app/anime/zoro/watch/' + id + '?server=vidcloud')
    }

    //Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGViZWFlYmMzNjgyYTI1YTQ0MmFkYTJjYjQ4M2YzNiIsInN1YiI6IjY2NDMwNTU5YzlhODVhYmZiODE4NDUxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXwd_NFZYYnyFuLHu6KHIpspK2DgWidRhUVP3WjTlPI'
    
}