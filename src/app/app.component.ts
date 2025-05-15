import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { YandexMapComponent } from './yandex-map/yandex-map.component';
import { YandexMapService } from './services/yandex-map.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent, YandexMapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  searchResults: any[] = [];
  selectedCategory: string | null = null;
  searchQuery: string | null = null;
  showYandexMap: boolean = false;
  isSidebarPartial: boolean = false;
  isCompanyDetailsOpen: boolean = false; // CompanyDetails holatini saqlash

  constructor(
    private cdRef: ChangeDetectorRef,
    private yandexMapService: YandexMapService
  ) {}

  ngOnInit(): void {
    this.yandexMapService.initializeMap(this.searchResults, (results) => {
      this.searchResults = results;
      this.cdRef.detectChanges();
    });
  }

  onCategorySelected(category: string): void {
    this.selectedCategory = category;
    this.showYandexMap = true;
    this.isSidebarPartial = true;
    console.log('Category selected, showYandexMap:', this.showYandexMap, 'isSidebarPartial:', this.isSidebarPartial);
    this.yandexMapService.setSelectedCategory(category);
    this.yandexMapService.performSearch(category);
    this.cdRef.detectChanges();
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.selectedCategory = query;
    this.showYandexMap = true;
    this.isSidebarPartial = true;
    console.log('Search query, showYandexMap:', this.showYandexMap, 'isSidebarPartial:', this.isSidebarPartial);
    this.yandexMapService.setSelectedCategory(query);
    this.yandexMapService.performSearch(query);
    this.cdRef.detectChanges();
  }

  onCompanyDetailsToggled(isOpen: boolean): void {
    this.isCompanyDetailsOpen = isOpen; // Holatni yangilaymiz
    if (isOpen) {
      this.showYandexMap = false;
      this.isSidebarPartial = true;
    } else {
      this.showYandexMap = (this.selectedCategory || this.searchQuery) ? true : false;
      this.isSidebarPartial = (this.selectedCategory || this.searchQuery) ? true : false;
    }
    console.log('CompanyDetails toggled, showYandexMap:', this.showYandexMap, 'isSidebarPartial:', this.isSidebarPartial, 'isCompanyDetailsOpen:', this.isCompanyDetailsOpen);
    this.cdRef.detectChanges();
  }
}