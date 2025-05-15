import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaskEmailPipe } from './mask-email.pipe';
import { CompanyService } from '../services/company.service';
import { SliderService } from '../services/slider.service';
import { MapService } from '../services/map.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MaskEmailPipe],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() company: any = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('commentTextarea', { static: false }) commentTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('map', { static: false }) mapElement!: ElementRef<HTMLDivElement>;

  reviews: any[] = [];
  images: any[] = [];
  currentImageIndex: number = 0;
  newReview = { comment: '', images: [] as File[], rating: 0 };
  selectedImage: string | null = null;
  companyRating: number = 0;
  reviewCount: number = 0;
  days: { name: string; hours: string }[] = [
    { name: 'Mon', hours: '11:00 AM - 10:00 PM' },
    { name: 'Tue', hours: '11:00 AM - 10:00 PM' },
    { name: 'Wed', hours: '11:00 AM - 10:00 PM' },
    { name: 'Thu', hours: '11:00 AM - 10:00 PM' },
    { name: 'Fri', hours: '11:00 AM - 10:00 PM' },
    { name: 'Sat', hours: '11:00 AM - 10:00 PM' },
    { name: 'Sun', hours: '11:00 AM - 10:00 PM' }
  ];
  isMenuOpen: boolean = false;

  constructor(
    private companyService: CompanyService,
    private sliderService: SliderService,
    private mapService: MapService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('CompanyDetailsComponent initialized with company:', this.company);
    if (this.company && this.company.companyMetaData?.id) {
      this.fetchData();
    } else {
      console.error('Company or companyMetaData.id is undefined');
    }
    this.parseHours();
  }

  ngAfterViewInit(): void {
    if (this.company && this.company.coords && this.company.coords.length === 2) {
      this.mapService.initYandexMap(
        this.mapElement.nativeElement,
        [this.company.coords[0], this.company.coords[1]],
        this.company.name
      );
    } else {
      console.error('Coordinates are not available for the map');
    }
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.sliderService.stopSlideShow();
  }

  fetchData(): void {
    const companyId = this.company.companyMetaData.id;
    forkJoin([
      this.companyService.fetchReviews(companyId),
      this.companyService.fetchImages(companyId),
      this.companyService.fetchCompanyRating(companyId)
    ]).subscribe({
      next: ([reviews, images, ratingData]) => {
        this.reviews = reviews;
        this.images = images;
        this.currentImageIndex = 0;
        this.companyRating = ratingData.rating;
        this.reviewCount = ratingData.reviewCount;
        console.log('Data fetched:', { reviews, images, ratingData });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.cdr.detectChanges();
      }
    });
  }

  parseHours(): void {
    if (this.company?.companyMetaData?.hours) {
      // Parse logikasi qo‘shilishi mumkin
    }
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];
    if (!this.company?.companyMetaData?.id) {
      console.error('Company ID is undefined');
      return;
    }

    this.companyService.uploadImage(this.company.companyMetaData.id, file)
      .subscribe({
        next: (response) => {
          console.log('Rasm muvaffaqiyatli yuklandi:', response);
          // Rasmni images ro'yxatiga qo'shamiz
          this.images.push(response);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Rasm yuklashda xato:', error);
          alert('Rasm yuklashda xato yuz berdi. Balki siz hisobga kirmagandirsiz.');
        }
      });
  }

  submitReview(): void {
    if (!this.company?.companyMetaData?.id) {
      console.error('Company ID is undefined');
      return;
    }
    if (!this.newReview.comment) {
      alert('Iltimos, sharh yozing.');
      return;
    }
    if (this.newReview.rating === 0) {
      alert('Iltimos, reyting tanlang.');
      return;
    }

    this.companyService.submitReview(this.company.companyMetaData.id, this.newReview)
      .subscribe({
        next: (response) => {
          console.log('Sharh muvaffaqiyatli qoldirildi:', response);
          this.fetchData();
          this.newReview = { comment: '', images: [], rating: 0 };
          if (this.commentTextarea) {
            this.commentTextarea.nativeElement.style.height = '20px';
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Sharh qoldirishda xato:', error);
          alert('Sharh qoldirishda xato yuz berdi. Iltimos, qayta urinib ko‘ring.');
        }
      });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files: FileList = input.files;
    const maxFiles = 5;
    const currentImages = this.newReview.images || [];

    if (files.length + currentImages.length > maxFiles) {
      alert(`Bir sharhga 5 tadan ortiq rasm yuklab bo‘lmaydi. Hozirda ${currentImages.length} ta rasm tanlangan.`);
      return;
    }

    const newImages: File[] = Array.from(files);
    this.newReview.images = [...currentImages, ...newImages];
    console.log('Updated images:', this.newReview.images);
    this.cdr.detectChanges();
  }

  removeImage(index: number): void {
    this.newReview.images = this.newReview.images.filter((_, i) => i !== index);
    console.log('Image removed, updated images:', this.newReview.images);
    this.cdr.detectChanges();
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
    console.log('Rating set to:', this.newReview.rating);
    this.cdr.detectChanges();
  }

  adjustTextareaHeight(): void {
    const textarea = this.commentTextarea.nativeElement;
    textarea.style.height = '20px';
    textarea.style.height = `${textarea.scrollHeight}px`;
    this.cdr.detectChanges();
  }

  openImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
    this.cdr.detectChanges();
  }

  closeImage(): void {
    this.selectedImage = null;
    this.cdr.detectChanges();
  }

  getDirections(): void {
    if (this.company && this.company.coords && this.company.coords.length === 2) {
      const lat = this.company.coords[0];
      const lon = this.company.coords[1];
      const url = `https://yandex.com/maps/?ll=${lon},${lat}&z=15&mode=routes&rtext=~${lat},${lon}`;
      window.open(url, '_blank');
    } else {
      alert('Manzil mavjud emas.');
    }
  }

goBack(): void {
    this.router.navigate(['/home']); // Home sahifasiga qaytish
  }

  startAutoSlide(): void {
    this.sliderService.startSlideShow(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.cdr.detectChanges();
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }

  deleteImage(): void {
    if (!this.company?.companyMetaData?.id || !this.images[this.currentImageIndex]) {
      console.error('Company ID or image is undefined');
      return;
    }

    const imageId = this.images[this.currentImageIndex].id;
    this.companyService.deleteImage(imageId, this.company.companyMetaData.id)
      .subscribe({
        next: () => {
          console.log('Image deleted successfully');
          this.images = this.images.filter((_, i) => i !== this.currentImageIndex);
          this.currentImageIndex = Math.min(this.currentImageIndex, this.images.length - 1);
          if (this.currentImageIndex < 0) this.currentImageIndex = 0;
          this.isMenuOpen = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          alert('Rasmni o‘chirishda xato yuz berdi. Iltimos, qayta urinib ko‘ring.');
        }
      });
  }

  getFilledStars(): number {
    return Math.round(this.companyRating);
  }
}