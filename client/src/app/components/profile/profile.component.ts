import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [UserService, FollowService],
})
export class ProfileComponent implements OnInit {
  public title: string;
  public url: string;
  public identity;
  public user;
  public token;
  public follows;
  public stats;
  public status: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowService
  ) {
    this.title = 'Profile';
    this.url = GLOBAL.url;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    console.log('users component ha sido cargado.');
    this.loadPage();
  }

  loadPage() {
    this._route.params.subscribe((params) => {
      let id = params['id'];
      this.getUser(id);
      this.getCounters(id);
    });
  }

  getUser(id) {
    this._userService.getUser(id).subscribe(
      (response) => {
        if (response.user) {
          this.status = 'success';
          this.user = response.user;
          console.log(response.user);
        } else {
          this.status = 'error';
        }
      },
      (err) => {
        console.log(<any>err);
        this.status = 'error';
        this._router.navigate(['/profile', this.identity._id]);
      }
    );
  }

  getCounters(id) {
    this._userService.getCounters(id).subscribe(
      (response) => {
        if (response) {
          console.log(response);
          this.stats = response;
        } else {
          this.status = 'error';
        }
      },
      (err) => {
        console.log(<any>err);
        this.status = 'error';
      }
    );
  }
}
