import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SliderService {
  private slides = [
    {
      title: "O'zingizga mos bo'lgan xizmatni toping",
      image: 'https://res.cloudinary.com/dz3q6hxqn/image/upload/v1753165285/find-best-restaurants-and-places-to-eat_n5dgka.jpg',
      alt: 'Beautiful Lawn',
      credit: "Ovqatlanish joylarini izlang va toping",
      creditDetail: 'O\'zingizga yaqinini tanlang va malumotlani oling'
    },
    {
      title: "Xizmat sifatini baholang va ulashing",
      image: 'https://res.cloudinary.com/dz3q6hxqn/image/upload/v1753165231/blog-post-websites-to-find-local-food-yelp-1024x684_gbylop.jpg',
      alt: "",
      credit: 'Masalan restaranlarni tanlang va sharhlarni o\'qing',
      creditDetail: 'Xizmatidan foydalaning va baholang'
    },
    {
      title: "Masalan Pitsa ",
      image: 'https://res.cloudinary.com/dz3q6hxqn/image/upload/v1753165290/KTvJj316971694741352_l_tn7o5r.jpg',
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