import * as jwt_decode  from 'jwt-decode';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { TranslateService } from '@ngx-translate/core';
import { DbserviceProvider } from './../../providers/dbservice/dbservice';
import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController, ActionSheetController, ModalController } from 'ionic-angular';
import { NgForm } from '@angular/forms';
import { ConstantProvider } from '../../providers/constant/constant';
import { ViewProfilePage } from '../view-profile/view-profile';
/**
 * Generated class for the SupportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-support',
  templateUrl: 'support.html',
})
export class SupportPage {

  data:any={};
  Support_Type:any=[];
  Support_hist:any=[];
  support_image:any=[];
  show_existFile:any=[];
  selectedFile:any=[];
  file_name:any='';
  loading: any;
  tokenInfo:any='';
  lang:any='en';
  karigar_info:any={};
  upload_url:any;
  saveFlag:boolean = false;

  constructor(public storage: Storage, public navCtrl: NavController, public navParams: NavParams, public service: DbserviceProvider, public translate:TranslateService, public actionSheetController: ActionSheetController, private camera: Camera, public alertCtrl: AlertController, public toastCtrl: ToastController,public modalCtrl:ModalController, public loadingCtrl: LoadingController, public constant: ConstantProvider) {
    this.upload_url = constant.upload_url;
   
    console.log(this.service)
    this.Support_Types();
    this.Support_history();
    this.karigar_detail();
   
 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SupportPage');
          
    this.translate.get("Camera")
    .subscribe(resp=>{
        this.cam = resp
    });
    
    this.translate.get("Gallery")
    .subscribe(resp=>{
        this.gal = resp
    });
    
    this.translate.get("Cancel")
    .subscribe(resp=>{
        this.cancl = resp
    });
    
    this.translate.get("OK")
    .subscribe(resp=>{
        this.ok = resp
    });
    
    this.translate.get("Upload File")
    .subscribe(resp=>{
        this.upl_file = resp
    });
    
    this.translate.get("Registered Successfully")
    .subscribe(resp=>{
        this.save_succ = resp
    });
    
}
Support_Types()
{
    
    this.service.post_rqst({},'app_karigar/category_list')
    .subscribe( (r) =>
    {
        console.log(r);
        this.Support_Type=r.category_data;
        
    });
}


Support_history()
{
    
    this.service.post_rqst({'karigar_id':this.service.karigar_id},'app_karigar/karigar_support_list')
    .subscribe( (r) =>
    {
        console.log(r);
        this.Support_hist=r.data;
        
    });
}

cam:any="";
gal:any="";
cancl:any="";
ok:any="";
upl_file:any="";
save_succ:any="";
onUploadChange(evt: any) {
    let actionsheet = this.actionSheetController.create({
        title:this.upl_file,
        cssClass: 'cs-actionsheet',
        
        buttons:[{
            cssClass: 'sheet-m',
            text: this.cam,
            icon:'camera',
            handler: () => {
                console.log("Camera Clicked");
                this.takePhoto();
            }
        },
        {
            cssClass: 'sheet-m1',
            text: this.gal,
            icon:'image',
            handler: () => {
                console.log("Gallery Clicked");
                this.getImage();
            }
        },
        {
            cssClass: 'cs-cancel',
            text: this.cancl,
            role: 'cancel',
            handler: () => {
                this.support_image=[];
                console.log('Cancel clicked');
            }
        }]
    });
    actionsheet.present();
}
takePhoto()
{
    const options: CameraOptions = {
        quality: 70,
        destinationType: this.camera.DestinationType.DATA_URL,
        targetWidth : 500,
        targetHeight : 400
    }
    
    console.log(options);
    this.camera.getPicture(options).then((imageData) => {
        var image = 'data:image/jpeg;base64,' + imageData;
        this.support_image.push(image);
        console.log(this.support_image);
    }, (err) => {
        // this.support_image=[];
    });
}

getImage()
{
    const options: CameraOptions = {
        quality: 70,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        saveToPhotoAlbum:false
    }
    this.camera.getPicture(options).then((imageData) => {
        var image = 'data:image/jpeg;base64,' + imageData;
        this.support_image.push(image);
        console.log(this.support_image);
    }, (err) => {
        // this.support_image=[];
    });
}

delete_img(index){
    
    this.support_image.splice(index,1);
    console.log('support_image  : ' +this.support_image.length );
}

viewDetail(image)
{
    this.modalCtrl.create(ViewProfilePage, {"Image": image}).present();
}


submit(f: NgForm){
    this.data.karigar_info = this.karigar_info;
    this.data.file = this.support_image;
    this.saveFlag = true;
    this.presentLoading(); 
    this.service.post_rqst({'data':this.data},'app_karigar/submit_support')
    .subscribe( (r) =>
    {
        this.loading.dismiss();
        console.log(r);
        if(r.status == "success"){
            this.saveFlag = false;
            this.support_image=[];
            f.resetForm();
            console.log(this.data);
            let toast = this.toastCtrl.create({
                message: "Support Query Successfully Added",
                duration: 3000
            });
            
            toast.present();
            this.Support_history();
        }else{
            this.saveFlag = false;
            let toast = this.toastCtrl.create({
                message: "Something went wrong, Try Again",
                duration: 3000
            });
            toast.present();
        }
        
    },(err)=>
    {
        this.loading.dismiss();
        let toast = this.toastCtrl.create({
            message: "Check Internet Connection, Try Again",
            duration: 3000
        });
        toast.present();
    });
}

karigar_detail()
{
    this.storage.get("token")
    .then(resp=>{
        this.tokenInfo = this.getDecodedAccessToken(resp );
        
        this.service.post_rqst({'karigar_id':this.tokenInfo.sub },'app_karigar/profile')
        .subscribe((r)=>
        {
            console.log(r);
            if(r['status'] == "SUCCESS"){
                
                this.karigar_info = r['karigar'];
                console.log(this.karigar_info);
            }
        })
    })
}
getDecodedAccessToken(token: string): any 
{
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
}   


presentLoading() 
{
    this.translate.get("Please wait...")
    .subscribe(resp=>{
        this.loading = this.loadingCtrl.create({
            content: resp,
            dismissOnPageChange: false
        });
        this.loading.present();
    })
}
}

