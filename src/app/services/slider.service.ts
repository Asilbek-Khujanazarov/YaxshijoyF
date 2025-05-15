import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  private slides = [
    {
      title: "O'zingizga mos bo'lgan xizmatni toping",
      image: '/images/find-best-restaurants-and-places-to-eat.jpg',
      alt: 'Beautiful Lawn',
      credit: "Ovqatlanish joylarini izlang va toping",
      creditDetail: 'O\'zingizga yaqinini tanlang va malumotlani oling'
    },
    {
      title: "Xizmat sifatini baholang va ulashing",
      image: '/images/blog-post-websites-to-find-local-food-yelp-1024x684.jpg',
      alt: "",
      credit: 'Masalan restaranlarni tanlang va sharhlarni o\'qing',
      creditDetail: 'Xizmatidan foydalaning va baholang'
    },
    {
      title: "Masalan Pitsa ",
      image: '/images/KTvJj316971694741352_l.jpg',
      alt: 'Xizmat sifatini baholang',
      credit: 'Xizmat sifatini baholang',
      creditDetail: 'Boshqalar uchun manfaatli bo\'ladi'
    }
  ];

  private slideIndex = 0;
  private intervalId: any;

  getCurrentSlide(): any {
    return this.slides[this.slideIndex];
  }

  getSlideIndex(): number {
    return this.slideIndex;
  }

  getSlides(): any[] {
    return this.slides;
  }

  startSlideShow(callback: () => void): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.slideIndex = (this.slideIndex + 1) % this.slides.length;
      callback();
    }, 5000);
  }

  stopSlideShow(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}