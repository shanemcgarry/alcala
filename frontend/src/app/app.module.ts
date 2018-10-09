import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav/';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule, MatRadioModule, MatSelectModule } from '@angular/material';
import { MatSliderModule } from '@angular/material/slider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { ImageViewerModule } from '@hallysonh/ngx-imageviewer';
import { ImageZoomModule } from 'angular2-image-zoom';
import { YoutubePlayerModule } from 'ngx-youtube-player';
import { ChartsModule } from 'ng2-charts';
import { NvD3Module } from 'ngx-nvd3';

import { PageComponent } from './core/page/page.component';
import { MonthComponent } from './core/month/month.component';
import { EntryComponent } from './core/entry/entry.component';
import { HomeComponent } from './shared/components/home/home.component';

import { PageService } from './core/service/page.service';
import { VisualisationService } from './core/service/visualisation.service';
import { SpinnerService } from './shared/services/spinner.service';
import { HttpErrorHandler } from './shared/services/http-error-handler.service';
import { MessageService } from './core/service/message.service';
import { ExpenseComponent } from './core/expense/expense.component';
import { SearchComponent } from './core/search/search.component';
import { VisualisationComponent } from './shared/components/visualisation/visualisation.component';
import { DashboardComponent } from './core/dashboard/dashboard.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { InfoBoxComponent } from './shared/components/info-box/info-box.component';
import { LoginComponent } from './shared/components/login/login.component';
import { UserSetupComponent } from './shared/components/user-setup/user-setup.component';
import { UserService } from './shared/services/user.service';
import { AuthGuard } from './shared/services/auth.guard';
import { LogoutComponent } from './shared/components/logout/logout.component';
import { routing } from './app.routing';
import { ChartComponent } from './shared/components/chart/chart.component';
import { TagCloudModule } from 'angular-tag-cloud-module';
import { SiteService } from './shared/services/site.service';
import { LocalStorageService } from 'ngx-store';
import { CurationComponent } from './core/curation/curation.component';
import { EditComponent } from './core/curation/edit/edit.component';
import { VizsearchComponent } from './core/vizsearch/vizsearch.component';


@NgModule({
  declarations: [
    AppComponent,
    PageComponent,
    MonthComponent,
    EntryComponent,
    HomeComponent,
    ExpenseComponent,
    SearchComponent,
    VisualisationComponent,
    DashboardComponent,
    SpinnerComponent,
    InfoBoxComponent,
    LoginComponent,
    UserSetupComponent,
    LogoutComponent,
    ChartComponent,
    CurationComponent,
    EditComponent,
    VizsearchComponent
  ],
  imports: [
    routing,
    BrowserModule,
    CommonModule,
    LayoutModule,
    OverlayModule,
    ChartsModule,
    YoutubePlayerModule,
    TagCloudModule,
    NvD3Module,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatListModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatRadioModule,
    MatTabsModule,
    MatChipsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatTableModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSliderModule,
    MatGridListModule,
    FormsModule,
    ReactiveFormsModule,
    ImageViewerModule,
    ImageZoomModule,
    FlexLayoutModule,
    HttpClientModule
  ],
  entryComponents: [ EditComponent ],
  providers: [PageService, HttpErrorHandler, MessageService, VisualisationService, SpinnerService, UserService, AuthGuard, SiteService, LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }