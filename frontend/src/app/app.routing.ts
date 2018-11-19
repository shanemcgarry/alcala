import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './shared/components/login/login.component';
import { HomeComponent } from './shared/components/home/home.component';
import { LogoutComponent } from './shared/components/logout/logout.component';
import { AuthGuard } from './shared/services/auth.guard';
import { SearchComponent } from './core/search/search.component';
import { PageComponent } from './core/page/page.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { CurationComponent } from './core/curation/curation.component';
import {VizsearchComponent} from './core/vizsearch/vizsearch.component';
import {TestComponent} from './shared/components/test/test.component';
import {TestLinksComponent} from './core/test-links/test-links.component';


const appRoutes: Routes = [
  { path: 'page/:id', component: PageComponent },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'visualise/dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'visualise/search/:graph', component: VizsearchComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'admin/curation', component: CurationComponent, canActivate: [AuthGuard] },
  { path: 'experiment', component: TestLinksComponent, canActivate: [AuthGuard] },
  { path: 'test', component: TestComponent },
  { path: '', component: HomeComponent }
];

export const routing = RouterModule.forRoot(appRoutes);
