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
  icons: any = [];
  iconName = 'arrow-down-circle';
  downloadListener: any;
  download: any;
  
  constructor(
              private apiService: ApiService
  ) { }

  ngOnInit() {
    for (let i = 0; i < this.state.length; i++) {
      this.icons[i] = 'arrow-down-circle';
    }
  }

  downloadEpisode(value: any, index: any) {
    let link = '';
    if (this.icons[index] == 'arrow-down-circle') {
      this.progress = document.getElementById('progress') as HTMLDivElement;
      this.progress.classList.remove("progressHidden");
      this.icons[index] = 'close-circle';
      
      this.playVideo(value.id).then((result: any) => {
        this.getDownloadLink(result.download).then((links: any) => {
          console.log(links)
          link = links[links.length-1].link;
          this.downloadListener = Filesystem.addListener("progress", data => {
            console.log(data.bytes + '/' + data.contentLength)
            this.current = this.current + data.bytes;
            this.max = data.contentLength;
          })

          this.download = Filesystem.downloadFile({
            url: link,
            path: value.id + '.mp4',
            directory: Directory.Library,
            progress: true,
          }).then((res: DownloadFileResult) => {
            this.progress.classList.add("progressHidden");
            this.current = 0;
            this.max = 0;
            this.icons[index] = 'checkmark-circle';
            console.log(res)
          });
        })
      })
    }

  else if (this.icons[index] == 'close-circle') {
    console.log(link)
    this.progress = document.getElementById('progress') as HTMLDivElement;
    this.progress.classList.add("progressHidden");
    this.icons[index] = 'arrow-down-circle';
    Filesystem.deleteFile({
      path: link,
      directory: Directory.Library
    })
    this.downloadListener.remove();
  }
    
    
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

