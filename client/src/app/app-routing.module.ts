import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent }  from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component'; 
import { MessagesComponent } from './components/messages/messages.component'; 
import { UsersComponent } from './components/users/users.component'; 
import { ProfileComponent } from './components/profile/profile.component'; 

const routes: Routes = [
	{path: '', component: HomeComponent}, 
	{path: 'login', component: LoginComponent},
	{path: 'register', component: RegisterComponent},
	{path: 'settings', component: UserEditComponent},
	{path: 'messages', component: MessagesComponent},
	{path: 'users', component: UsersComponent},
	{path: 'users/:page', component: UsersComponent},
	{path: 'profile/:id', component: ProfileComponent},
	{path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
