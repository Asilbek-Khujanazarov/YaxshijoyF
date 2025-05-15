import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageSliderService {
  private currentImageIndex = 0;
  private slideInterval: any;

  startAutoSlide(images: any[], callback: () => void): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    this.slideInterval = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
      callback();
    }, 3000);
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  getCurrentImageIndex(): number {
    return this.currentImageIndex;
  }

  setCurrentImageIndex(index: number): void {
    this.currentImageIndex = index;
  }
}