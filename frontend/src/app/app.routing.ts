import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './shared/components/login/login.component';
import { HomeComponent } from './shared/components/home/home.component';
import { LogoutComponent } from './shared/components/logout/logout.component';
import { AuthGuard } from './shared/services/auth.guard';
import { SearchComponent } from './core/search/search.component';
import { PageComponent } from './core/page/page.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import {VizsearchComponent} from './core/vizsearch/vizsearch.component';
import {TestLinksComponent} from './core/test-links/test-links.component';
import {AdminDashboardComponent} from './core/admin/admin-dashboard/admin-dashboard.component';
import {BoundaryObjectComponent} from './shared/components/boundary-object/boundary-object.component';
import {PosterDetailComponent} from './shared/components/poster-detail/poster-detail.component';
import {ProjectInfoComponent} from './core/project-info/project-info.component';


const appRoutes: Routes = [
  { path: 'page/:id', component: PageComponent, canActivate: [AuthGuard] },
  { path: 'poster/:id', component: PosterDetailComponent, canActivate: [AuthGuard] },
  { path: 'boundary/:id', component: BoundaryObjectComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'visualise/search/:graph', component: VizsearchComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'experiment', component: TestLinksComponent, canActivate: [AuthGuard] },
  { path: 'about', component: ProjectInfoComponent},
  { path: '', component: HomeComponent }
];

export const routing = RouterModule.forRoot(appRoutes);
