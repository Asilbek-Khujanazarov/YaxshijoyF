import { Routes } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';

export const routes: Routes = [
  { path: 'home', component: SidebarComponent, title: 'Home Page' },
  { path: 'company/:id', component: CompanyDetailsComponent, title: 'Company Details' },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default sahifa
  { path: '**', redirectTo: '/home' } // 404 uchun
];