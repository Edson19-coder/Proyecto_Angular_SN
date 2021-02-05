import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from './services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent {
  public title;
  public identity;
  constructor(
    private _userService: UserService,
    private _router: Router,
    private _route: ActivatedRoute){
  	this.title = 'SOCIAL NETWORK'
  }

  ngOnInit(){
  	this.identity = this._userService.getIdentity();
  }

  logout(){
    localStorage.clear();
    this.identity = null;
    this._router.navigate(['/']);
  }
}
