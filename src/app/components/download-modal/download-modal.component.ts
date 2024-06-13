import { Component, Input, OnInit } from '@angular/core';
import { Directory, DownloadFileResult, Filesystem } from '@capacitor/filesystem';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/api/api.service';

@Component({
  selector: 'app-download-modal',
  templateUrl: './download-modal.component.html',
  styleUrls: ['./download-modal.component.scss'],
})
export class DownloadModalComponent  implements OnInit {
  @Input() state: any;
  public subscription: any = Subscription;
  progress: any;
  icon: any;
  current = 0;
  max = 0;
  interval: any;
  iconName = 'arrow-down-circle';
  
  constructor(
              private apiService: ApiService
  ) { }

  ngOnInit() {
    Filesystem.removeAllListeners();
    
    // 
    // console.log(this.progress);
  }

  downloadEpisode(value: any) {
    this.progress = document.getElementById('progress') as HTMLDivElement;
    this.progress.classList.remove("progressHidden");
    this.iconName = 'close-circle';
    
    this.playVideo(value.id).then((result: any) => {
      this.getDownloadLink(result.download).then((links: any) => {

        Filesystem.addListener("progress", data => {
          console.log(data.bytes + '/' + data.contentLength)
          this.current = data.bytes;
          this.max = data.contentLength;
        })

        Filesystem.downloadFile({
          url: links[links.length-1].link,
          path: value.id + '.mp4',
          directory: Directory.Library,
          progress: true,
        }).then((res: DownloadFileResult) => {
          console.log(res)
        });
      })
    })
    
  }

  playVideo(value: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimePlayVideo(value).subscribe(
        (result: any) => {
          resolve(result)
        },
        (error) => {
          reject(error);
        }
      )
    })
  }

  getDownloadLink(id: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.apiService.gogoAnimeDownload(id).subscribe(
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

