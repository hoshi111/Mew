import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { readBlobAsBase64 } from '@capacitor/core/types/core-plugins';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ActionSheetController } from '@ionic/angular';
import { getAuth, signOut, updateProfile } from "firebase/auth";

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {
  localstorage = localStorage;
  name: any;
  profileImg: any;
  camera = Camera;
  auth: any = getAuth();
  IMAGE_DIR = 'stored-images';
  images: any = [];

  profile: any;


  constructor(private router: Router,
              private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.name = this.localstorage.getItem('name');
    this.profileImg = this.localstorage.getItem('profileImg');

    this.loadFiles().then(() => {
    })
  }

  showWatchList() {
    this.router.navigate(['watch-list']);
  }
  
  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image source',
      buttons: [{
        text: 'Load from Library',
        handler: () => {
         this.pickImage();
        }
     },
     {
      text: 'Use Camera',
      handler: () => {
        // this.takePicture(this.camera.getPhoto);
       }
     },
     {
      text: 'Cancel',
      role: 'cancel'
     }]
   });
   await actionSheet.present();
  }

  async pickImage() {
    const image = this.camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    })

    if (image) {
      this.saveImage(await image)
    }

    // await this.loadFiles().then(() => {
    //   console.log("Image: ", this.images)
    // })

  }

  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
        path: `${this.IMAGE_DIR}/${fileName}`,
        data: base64Data,
        directory: Directory.Data
    });

    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
}

  private async readAsBase64(photo: any) {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath);
        const blob = await response.blob();

        return await this.convertBlobToBase64(blob) as string;
    
  }

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
          resolve(reader.result);
      };
      reader.readAsDataURL(blob);
  });

  async loadFiles() {
		this.images = [];

		Filesystem.readdir({
			path: this.IMAGE_DIR,
			directory: Directory.Data
		})
			.then(
				(result) => {
					this.loadFileData(result.files.map((x) => x.name));
				},
				async (err) => {
					// Folder does not yet exists!
					await Filesystem.mkdir({
						path: this.IMAGE_DIR,
						directory: Directory.Data
					});
				}
			)
	}

  async loadFileData(fileNames: string[]) {
		for (let f of fileNames) {
			const filePath = `${this.IMAGE_DIR}/${f}`;

			const readFile = await Filesystem.readFile({
				path: filePath,
				directory: Directory.Data
			});

			this.images.push({
				name: f,
				path: filePath,
				data: `data:image/jpeg;base64,${readFile.data}`
			});
		}
	}

  // takePicture(sourceType: CameraSource.Photos) {
  //   const options: ImageOptions = {
  //     quality: 100,
  //     sourceType: sourceType,
  //     saveToPhotoAlbum: false,
  //     correctOrientation: true
  //   };
  //   this.camera.getPicture(options).then(imagePath => {
  //     if (this.plt.is('android') && sourceType === 
  //     this.camera.PictureSourceType.PHOTOLIBRARY) {
  //       this.filePath.resolveNativePath(imagePath).then(filePath => {
  //       const correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
  //       const currentName = imagePath.substring(
  //         imagePath.lastIndexOf('/') + 1,
  //         imagePath.lastIndexOf('?'));
  //       this.copyFileToLocalDir(
  //         correctPath,
  //         currentName,
  //         this.createFileName()
  //       );
  //     });
  //     }
  //   }
    // else {
    //   const currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
    //   const correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
    //   this.copyFileToLocalDir(
    //     correctPath,
    //     currentName,
    //     this.createFileName()
    //   );
    //  }
    // });
  // }

  logOut() {
    this.localstorage.removeItem('uid');
    this.localstorage.removeItem('name');
    this.localstorage.removeItem('user');
    this.localstorage.removeItem('profileImg');
    const auth = getAuth();
    signOut(auth).then(() => {
      this.router.navigate(['splashscreen']);
    }).catch((error) => {
      alert('Logout Failed!');
    });
  }
}
