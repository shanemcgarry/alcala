import { Component, OnInit } from '@angular/core';
import {SiteService} from '../../services/site.service';
import {AlcalaPage} from '../../models/alcala-page.model';
import {environment} from '../../../../environments/environment';
import { SwiperComponent, SwiperDirective, SwiperConfigInterface, SwiperScrollbarInterface, SwiperPaginationInterface } from 'ngx-swiper-wrapper';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  sampleData: AlcalaPage[];
  swiperConfig: SwiperConfigInterface = {
    a11y: true,
    direction: 'horizontal',
    init: true,
    slidesPerView: 1,
    slidesPerColumnFill: 'column',
    slidesPerColumn: 1,
    speed: 300,
    keyboard: true,
    mousewheel: true,
    scrollbar: false,
    navigation: true,
    loop: true,
    centeredSlides: true,
    effect: 'coverflow',
    coverflowEffect: {
      slideShadows: true,
      rotate: 10
    },
    autoplay: {
      delay: 5000
    },
    pagination: {
      type: 'bullets'
    }
  };

  constructor(private siteService: SiteService, private router: Router) { }

  ngOnInit() {
/*    this.siteService.getSampleData(10)
      .subscribe(
        data => this.sampleData = data,
        err => console.log(err),
        () => console.log('Sample Data loaded')
      );*/
  }

  onViewClick(pageid: string): void {
    this.router.navigate([`page/${pageid}`]);
  }

  getCardTitle(data: AlcalaPage): string {
    const result: string[] = [];
    data.months.forEach(x => {
      const newDate = new Date(data.year, x.month, 1);
      result.push(newDate.toLocaleDateString('en-uk', { month: 'long' }));
    });
    return `${result.join(' & ')} ${data.year}`;
  }

  getCardSubtitle(data: AlcalaPage): string {
    let result = `Details of expenditures for ${this.getCardTitle(data)}`;
    const maxWords = 50;
    if (Array.isArray(data.months[0].expenses) && data.months[0].expenses.length > 0) {
      if (data.months[0].expenses[0].description) {
        result = data.months[0].expenses[0].description.english.split(' ').slice(0, maxWords).join(' ');
      } else if (data.months[0].expenses[0].entries) {
        const entries: string[] = [];
        data.months[0].expenses[0].entries.forEach(x => entries.concat(x.description.english.split(' ')));
        result = entries.slice(0, maxWords).join(' ');
      } else if (data.months[0].expenses[0].title) {
        result = data.months[0].expenses[0].title.english;
      }
    } else if (data.months[0].signOff) {
      result = data.months[0].signOff.declaration.english.split(' ').slice(0, maxWords).join(' ');
    }

    return result;
  }

  getImageUrl(data: AlcalaPage): string {
    return  `${environment.imageUrl}${data.id}.jpg`;
  }

}
