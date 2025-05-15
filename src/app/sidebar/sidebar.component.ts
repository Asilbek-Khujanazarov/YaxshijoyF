import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyDetailsComponent } from '../company-details/company-details.component';
import { CompanyService } from '../services/company.service';
import { SliderService } from '../services/slider.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, CompanyDetailsComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnChanges, OnInit, OnDestroy {
  @Input() searchResults: any[] = [];
  @Input() searchQuery: string | null = null;
  @Output() categorySelected = new EventEmitter<string>();
  @Output() companyDetailsToggled = new EventEmitter<boolean>();

  categories: string[] = [
    "Pizza", "Lavash", "Fast Food", "Joja", "Osh Markazi", "Choyxona", "Milliy Taom",
    "Restoran", "Kafe", "Sushi va Yapon Taom", "Barbekyu va Gril", "Vegetarian va Sog‘lom Taom",
    "Shirinlik va Desert", "Xalqaro Oshxona", "Halol Taom", "Street Food", "Banket Zal",
    "Dengiz Mahsulot", "Burger", "Koreys Taom", "Turk Oshxonasi", "Pab va Bar", "Nonvoyxona",
    "Qahvaxona", "Churrasco va Steakhouse", "Bufet va Ochiq Stol", "Mahalliy Taomlar",
    "Yevropa Oshxonasi"
  ];
  selectedCategory: string | null = null;
  selectedCompany: any = null;

  currentSlide: any;
  slideIndex: number = 0;
  slides: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private companyService: CompanyService,
    private sliderService: SliderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.slides = this.sliderService.getSlides();
    this.currentSlide = this.sliderService.getCurrentSlide();
    this.slideIndex = this.sliderService.getSlideIndex();
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    this.sliderService.stopSlideShow();
    this.companyService.clearCache();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchResults'] && this.searchResults) {
      this.selectedCompany = null;
      this.companyDetailsToggled.emit(false);
      this.fetchDataForResults();
    }
  }

  fetchDataForResults(): void {
    this.companyService.fetchDataForResults(this.searchResults).subscribe({
      next: () => {
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.cdr.detectChanges();
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.categorySelected.emit(category);
    this.cdr.detectChanges();
  }

openCompanyDetails(company: any): void {
    console.log('Opening company details for:', company);
    this.selectedCompany = company;
    this.companyDetailsToggled.emit(true);
    // Routing orqali company-details ga o'tish
    if (company.companyMetaData?.id) {
      this.router.navigate(['/company', company.companyMetaData.id]);
    }
    this.cdr.detectChanges();
  }

  closeCompanyDetails(): void {
    this.selectedCompany = null;
    this.companyDetailsToggled.emit(false);
    this.cdr.detectChanges();
  }

  onSearchResultsUpdate(results: any[]): void {
    this.searchResults = results;
    this.fetchDataForResults();
  }

  getFilledStars(companyId: string): number {
    return this.companyService.getFilledStars(companyId);
  }

  getRating(companyId: string): number {
    return this.companyService.getRating(companyId);
  }

  getReviewCount(companyId: string): number {
    return this.companyService.getReviewCount(companyId);
  }

  getFirstImageUrl(companyId: string): string {
    return this.companyService.getFirstImageUrl(companyId);
  }

  getDirections(event: Event, item: any): void {
    event.stopPropagation();
    const lat = item.coords?.[0];
    const lon = item.coords?.[1];

    if (lat && lon) {
      const url = `https://yandex.com/maps/?ll=${lon},${lat}&z=15&mode=routes&rtext=~${lat},${lon}`;
      window.open(url, '_blank');
    } else {
      alert('Manzil koordinatalari mavjud emas. Iltimos, ma\'lumotlarni tekshiring.');
    }
  }

  startSlideShow(): void {
    this.sliderService.startSlideShow(() => {
      if (!this.selectedCategory && !this.searchQuery) {
        this.currentSlide = this.sliderService.getCurrentSlide();
        this.slideIndex = this.sliderService.getSlideIndex();
        this.cdr.detectChanges();
      }
    });
  }
}