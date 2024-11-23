import { Injectable } from '@angular/core';

@Injectable()

export class GlobalVariable {
    public data: any;
    isAnime: boolean = false;
    mangaId: any;
    fromPlayer: boolean = false;
    animeCurrentId: any;
    animeCurrentEpisodes: any;
    animePlayingData: any;
}