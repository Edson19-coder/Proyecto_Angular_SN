import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  
  public title: string;
  public user: User;
  public status: string;
  public identity;
  public token;

  constructor(
  	private _route: ActivatedRoute, 
    private _router: Router,
    private _userService: UserService) { 
  		this.title = 'Messages';
  		this.user = this._userService.getIdentity();
  		this.identity = this.user;
  		this.token = this._userService.getToken();
  }

  ngOnInit(): void {
  	console.log('messages component se ha cargado');
  	console.log(this.user);
  }

}
