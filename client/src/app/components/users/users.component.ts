import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { GLOBAL } from '../../services/global';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService, FollowService]
})
export class UsersComponent implements OnInit {
  public title: string;
  public url: string;
  public identity;
  public token;
  public page;
  public nextPage;
  public prevPage;
  public total;
  public pages;
  public users: User[];
  public follows;
  public status: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowService
  ) {
    this.title = 'Users';
    this.url = GLOBAL.url;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }

  ngOnInit(): void {
    console.log('users component ha sido cargado.');
    this.actualPage();
  }

  actualPage() {
    this._route.params.subscribe((params) => {
      let page = +params['page'];
      this.page = page;

      if (!params['page']) {
        page = 1;
      }

      if (!page) {
        page = 1;
      } else {
        this.nextPage = page + 1;
        this.prevPage = page - 1;
      }

      if (this.prevPage <= 0) {
        this.prevPage = 1;
      }

      //Devolver listado de usuarios.
      this.getUsers(this.page);
    });
  }

  getUsers(page) {
    this._userService.getUsers(page).subscribe(
      (response) => {
        if (!response.users) {
          this.status = 'error';
        } else {
          this.total = response.total;
          this.users = response.users;
          this.pages = response.pages;
          this.follows = response.users_following;
          if (page > this.pages) {
            this._router.navigate(['/users', 1]);
          }
        }
      },
      (err) => {
        var errorMessage = <any>err;
        console.log(errorMessage);

        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }

  public followUserOver;
  mouseEnter(user_id) {
    this.followUserOver = user_id;
  }

  mouseLeave(user_id) {
    this.followUserOver = 0;
  }

  followUser(followed) {
    var follow = new Follow('', this.identity._id, followed);
    this._followService.addFollow(this.token, follow).subscribe(
      (response) => {
        if (!response) {
          this.status = 'error';
        } else {
          this.status = 'success';
          this.follows.push(followed);
        }
      },
      (err) => {
        var errorMessage = <any>err;
        console.log(errorMessage);

        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }

  unfollowUser(followed) {
    this._followService.deleteFollow(this.token, followed).subscribe(
      (response) => {
        var searchFollow = this.follows.indexOf(followed);
        if (searchFollow != -1) {
          this.follows.splice(searchFollow, 1);
        }
      },
      (err) => {
        var errorMessage = <any>err;
        console.log(errorMessage);

        if (errorMessage != null) {
          this.status = 'error';
        }
      }
    );
  }
}
