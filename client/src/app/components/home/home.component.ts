import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import { UploadService } from '../../services/upload.service';
import { GLOBAL } from '../../services/global';
import { Publication } from 'src/app/models/publication';
import { HttpHandler, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [UserService, PublicationService, UploadService],
})
export class HomeComponent implements OnInit {
  public title: string;
  public user: User;
  public publications: Publication[];
  public status: string;
  public page;
  public total;
  public pages;
  public identity;
  public token;
  public publication;
  public url;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _uploadService: UploadService
  ) {
    this.title = 'Home Component';
    this.identity = this._userService.getIdentity();
    this.url = GLOBAL.url;
    this.publication = new Publication("", "", "", "", "");
    this.token = this._userService.getToken();
    this.page = 1;
  }

  ngOnInit() {
    console.log('home component ha sido cargado.');
    this.getPublications(this.page);
  }

  onSubmit(form) {

    this._publicationService
      .addPublication(this.token, this.publication)
      .subscribe(
        (response) => {
          if (response) {
            this.status = 'success';
            //this.publication = response.publication;
            form.reset();
          } else {
            this.status = 'error';
          }
        },
        (err) => {
          var errorMenssage = <any>err;
          console.log(errorMenssage);
          this.status = 'error';
        }
      );
  }

  getPublications(page){
    this._publicationService.getPublications(this.token, page).subscribe(
      response => {
        if(response){
          this.total = response.total_items;
          this.pages = response.pages;
          this.publications = response.publications;

          if(page > this.pages){
            this._router.navigate(['/']);
          }
          
          this.status = 'success';
        }else{
          this.status = 'error';
        }
      },
      err => {
          var errorMenssage = <any>err;
          console.log(errorMenssage);
          this.status = 'error';
      }
    );
  }

}
