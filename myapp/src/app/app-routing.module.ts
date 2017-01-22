import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './home.component';
import { Login } from './login.component';
import { Signup } from './signup.component';
import { FoodSearchComponent } from './food-search.component'
import { FoodAnalysisComponent } from './food-analysis.component'
import { AuthGuard } from './common/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'signup',
    component: Signup
  },
  {
    path: 'home',
    component: Home,
    canActivate: [AuthGuard]
  },
  {
    path: 'search',
    component: FoodSearchComponent
  },
  {
    path: 'analyze/:id',
    component: FoodAnalysisComponent
  }
]

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
