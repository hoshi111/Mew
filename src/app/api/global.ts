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
    outtroTimeStart = 0;
    outtroTimeEnd = 0;
    introTimeStart = 0;
    introTimeEnd = 0;
}