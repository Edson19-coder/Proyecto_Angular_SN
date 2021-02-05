import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

	public title: string;
  public user: User;
  public status: string;
  public identity;
  public token;

  constructor(
    private _route: ActivatedRoute, 
    private _router: Router,
    private _userService: UserService
    ) { 
    this.title = 'Login Component';
    this.user = new User("", "", "", "","", "","","");
  }

  ngOnInit(): void {
  	console.log('Componente de login cargando...');
  }

  onSubmit(form){
    this._userService.singup(this.user).subscribe(response=>{

      if(response.user && response.user._id){
        this.identity = response.user;
        
        localStorage.setItem('identity', JSON.stringify(this.identity));

        this.getToken();
      }else{
        this.status = 'error';
      }
    
    }, err=>{
    
      var errorMessage = <any>err;
      console.log(errorMessage);
      if(errorMessage != null){
        this.status = 'fail';
      }
    
    });
  }

  getToken(){
    this._userService.singup(this.user, 'true').subscribe(response=>{
      this.token = response.token;
      if(this.token.length <= 0){
        this.status = 'error';
      }else{
        //Persistir token del usuario.
        localStorage.setItem('token', this.token);

        //Conseguimos las estadisticas del usuario.
        this.getCounters();
      }
    
    }, err=>{
    
      var errorMessage = <any>err;
      console.log(errorMessage);
      if(errorMessage != null){
        this.status = 'fail';
      }
    
    });
  }

  getCounters() {
        this._userService.getCounters().subscribe(
            response => {
                localStorage.setItem('stats', JSON.stringify(response));
                this.status = 'success';
                this._router.navigate(['/']);
            },
            error => {
                console.log(<any>error);
            }
        )
    }
}
