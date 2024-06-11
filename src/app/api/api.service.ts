import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { throwError } from "rxjs";

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

    gogoAnimeRecentEp(page: number) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/recent-episodes?page=' + page);
    }

    gogoAnimeTopAiring(page: number) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/top-airing?page=' + page)
    }

    getAnimeVideoServer(id: any) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/info/' + id)
    }

    searchAnime(query: string, page: number) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/' + query + '?page=' + page)
    }

    gogoAnimeGetDetails(query: string) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/info/' + query)
    }

    gogoAnimePlayVideo(query: any) {
        return this.http.get('https://consumet-beige.vercel.app/anime/gogoanime/watch/' + query)
    }

    kdramaSearch(query: any) {
        return this.http.get('https://consumet-beige.vercel.app/movies/dramacool/' + query)
    }

    kdramaPlayVideo(episodeId: any, dramaId: any) {
        return this.http.get('https://consumet-beige.vercel.app/movies/dramacool/watch?episodeId=' + episodeId + '&mediaId=' + dramaId + '&server=asianload')
    }

    kdramaInfo(id: any) {
        return this.http.get('https://consumet-beige.vercel.app/movies/dramacool/info?id=' + id)
    }

    //Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OGViZWFlYmMzNjgyYTI1YTQ0MmFkYTJjYjQ4M2YzNiIsInN1YiI6IjY2NDMwNTU5YzlhODVhYmZiODE4NDUxOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vXwd_NFZYYnyFuLHu6KHIpspK2DgWidRhUVP3WjTlPI'
    
}