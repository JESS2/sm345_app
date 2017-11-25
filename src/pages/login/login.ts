import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { 
  NavController, 
  ModalController, 
  AlertController, 
  ToastController, 
  ViewController,
  LoadingController,
  App 
} from 'ionic-angular';

import { HomePage } from '.././home/home';
import { MyApp } from '../../app/app.component';
import { User } from '../../models/user';
import { Message } from '../../models/message';
import { ServerService } from '../../app/server.service';

@Component({
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {
  public user: User;
  private message: Message;
  private login_record: number = 0;

  constructor(
    public app: App, 
    private serverService: ServerService, 
    private http: Http, 
    public navCtrl: NavController, 
    public appCtrl: App, 
    public toastCtrl: ToastController, 
    public alertCtrl: AlertController, 
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public loadingCtrl: LoadingController,
  ) { }

  ngOnInit() {
    this.user = new User();
    this.message = new Message();
  }

  //로그인
  signIn(){
    if (typeof this.user.user_id !== 'number' && isNaN(Number(this.user.user_id)) !== false) {
      this.UserIdToast('유저아이디를 숫자로 입력해 주세요.')
    } else {
      this.loading()
      this.serverService.getLoginrecord(this.user)
      .then(message =>
      {
        if(message.key == -1)
          this.presentLoginToast(message);
        else if(message.key == -2)
          this.presentLoginToast(message);
        else if(message.key == -3)
          this.presentLoginToast(message);
        else if(message.key == -4)
          this.presentLoginToast(message);
        else {
          this.login_record = message.login_record;
          
          if(this.login_record == 0) this.showPasswordAlert();
          else {
            this.serverService.makeLogin(this.user)
            .then(message =>
            {  
              if(message.key == -1) this.presentLoginToast(message);
              if(message.key == 2) this.presentLoginToast(message);
              if(message.key == 0) {
        
                localStorage.setItem('currentUser', JSON.stringify({ 
                  USERID: message.user_id,
                  USERNAME: message.user_name,
                  USERAUTH: message.user_auth}));
  
                  this.presentLoginToast(message);
                  this.appCtrl.getRootNav().setRoot(MyApp);
                  window.location.reload();
                }
            });
          }
        }
      }) 
    }
  }  

  dismiss() {
    this.viewCtrl.dismiss();
  }

  presentLoginToast(message) {
    let toast = this.toastCtrl.create({
      message: message.title,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }

  UserIdToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    toast.present();
  }

  openHomePage() {
    this.navCtrl.setRoot(HomePage);
  }

  showPasswordAlert() {
    let prompt = this.alertCtrl.create({
       title: '비밀번호 변경',
       inputs: [
            {
              name: 'password',
              type: 'password',
              placeholder: '기존 비밀번호',
           },
           {
              name: 'newPassword',
              type: 'password', 
              placeholder: '새 비밀번호',
           },
           {
              name: 'newPasswordCheck',
              type: 'password', 
              placeholder: '비밀번호 확인',
          }
       ],
       buttons: [
          {
             text: '취소',
             handler: data => {
             }
          },
          {
            text: '확인',
            handler: data => {
              this.user.user_password = data['newPassword'];
              this.serverService.updatePassword(this.user)
                .then(message =>
                {
                  this.presentLoginToast(message);

                  localStorage.setItem('currentUser', JSON.stringify({ 
                    USERID: message.user_id,
                    USERNAME: message.user_name,
                    USERAUTH: message.user_auth
                  }));
                  this.presentLoginToast(message);
                  this.appCtrl.getRootNav().setRoot(MyApp);
                  window.location.reload();

                });
            }
          }
       ]  
    });
    prompt.present();
  }

  loading() {
    let loading = this.loadingCtrl.create({
        content: 'Loading...'
      });
    
      loading.present();
    
      setTimeout(() => {
        loading.dismiss();
      }, 3000);
  }
}