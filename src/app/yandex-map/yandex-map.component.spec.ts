import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare const ymaps: any;

@Component({
  selector: 'app-yandex-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './yandex-map.component.html',
  styleUrls: ['./yandex-map.component.css']
})
export class YandexMapComponent implements OnInit, OnChanges {
  @Input() selectedCategory: string | null = null;
  @Input() searchQuery: string | null = null;
  @Input() selectedLocation: any | null = null;
  @Output() searchResultsUpdate = new EventEmitter<any[]>();

  searchResults: any[] = [];
  map: any;
  userCoords: number[] = [41.311081, 69.240562];
  private searchControl: any;
  private lastSearchQuery: string | null = null;
  private isInitialLoad: boolean = true;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    ymaps.ready(() => {
      this.map = new ymaps.Map('map', {
        center: this.userCoords,
        zoom: 12,
        controls: ['geolocationControl']
      });

      this.map.behaviors.enable([
        'drag',
        'scrollZoom',
        'multiTouch',
        'dblClickZoom'
      ]);

      ymaps.geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
      }).then((result: any) => {
        this.userCoords = result.geoObjects.get(0).geometry.getCoordinates();
        console.log('User location:', this.userCoords);
        this.map.setCenter(this.userCoords, 14);
        this.updateSearchBounds();
      }).catch((error: any) => {
        console.error('Geolocation error:', error);
      });

      const geolocationControl = this.map.controls.get('geolocationControl');
      geolocationControl.events.add('locationchange', (e: any) => {
        const newCoords = e.get('position');
        if (newCoords) {
          this.userCoords = newCoords;
          console.log('Geolocation updated:', this.userCoords);
          this.map.setCenter(this.userCoords, 14);
          this.updateSearchBounds();
          this.performAutoSearch();
        }
      });

      this.searchControl = new ymaps.control.SearchControl({
        options: {
          provider: 'yandex#search',
          boundedBy: this.calculateBoundedBy(this.userCoords),
          strictBounds: false,
          noPlacemark: true,
          results: 20
        }
      });

      this.setupSearchControl();

      this.map.events.add('boundschange', () => {
        if (!this.isInitialLoad) {
          this.userCoords = this.map.getCenter();
          this.updateSearchBounds();
          this.performAutoSearch();
        }
        this.isInitialLoad = false;
      });
    }).catch((error: any) => {
      console.error('Yandex Maps API failed to load:', error);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] && this.map) {
      const category = changes['selectedCategory'].currentValue;
      if (category) {
        this.lastSearchQuery = category;
        this.performSearch(category);
      }
    }
    if (changes['searchQuery'] && this.map) {
      const query = changes['searchQuery'].currentValue;
      if (query) {
        this.lastSearchQuery = query;
        this.performSearch(query);
      }
    }
    if (changes['selectedLocation'] && this.map && changes['selectedLocation'].currentValue) {
      const location = changes['selectedLocation'].currentValue;
      this.focusOnLocation(location);
    }
  }

  setupSearchControl(): void {
    this.searchControl.events.add('load', (e: any) => {
      if (!e.get('skip')) {
        const results = this.searchControl.getResultsArray();
        console.log('Search results array:', results);

        this.searchResults = [];
        this.map.geoObjects.removeAll();

        results.forEach((item: any, index: number) => {
          try {
            const properties = item.properties.getAll();
            const geocoderMetaData = properties.metaDataProperty?.GeocoderMetaData || {};
            const companyMetaData = properties.CompanyMetaData || properties.companyMetaData || {};

            console.log(`Item ${index + 1} Properties:`, JSON.stringify(properties, null, 2));
            console.log(`Item ${index + 1} CompanyMetaData:`, JSON.stringify(companyMetaData, null, 2));

            const fullAddress = geocoderMetaData.text || properties.description || companyMetaData.address || 'N/A';
            const countryName = geocoderMetaData.AddressDetails?.Country?.CountryName || 'N/A';
            const addressComponents = geocoderMetaData.Address?.Components || [];
            const name = properties.name || companyMetaData.name || geocoderMetaData.name || 'N/A';
            const description = properties.description || geocoderMetaData.text || 'N/A';
            const coords = item.geometry.getCoordinates() || [];
            const phones = companyMetaData.Phones?.length
              ? companyMetaData.Phones.map((phone: any) => phone.formatted || phone).join(', ')
              : properties.phoneNumbers?.join(', ') || 'N/A';
            const categories = companyMetaData.Categories?.length
              ? companyMetaData.Categories.map((cat: any) => `${cat.name} (${cat.class || 'N/A'})`).join(', ')
              : properties.categories?.join(', ') || geocoderMetaData.kind || 'N/A';
            const hours = companyMetaData.Hours?.text || properties.workingTime || 'N/A';
            const url = companyMetaData.url || properties.url || 'N/A';

            const resultItem = {
              name,
              description,
              fullAddress,
              countryName,
              coords,
              addressComponents,
              companyMetaData: {
                address: companyMetaData.address || fullAddress,
                url,
                phones,
                categories,
                hours
              }
            };
            this.searchResults.push(resultItem);
            this.addPlacemark(coords, name, fullAddress);
          } catch (error) {
            console.error(`Error processing item ${index + 1}:`, error);
          }
        });

        console.log('Final searchResults:', this.searchResults);
        this.searchResultsUpdate.emit([...this.searchResults]);
        this.cdRef.detectChanges();
      }
    });
  }

  performSearch(query: string): void {
    this.searchControl.search(query);
    console.log(`Searching for: ${query}`);
  }

  performAutoSearch(): void {
    const query = this.lastSearchQuery || this.selectedCategory;
    if (query) {
      this.performSearch(query);
    }
  }

  focusOnLocation(location: any): void {
    const coords = location.coords;
    if (coords && coords.length === 2) {
      this.map.setCenter(coords, 16);
      this.addPlacemark(coords, location.name, location.description);
      console.log('Focused on location:', coords);
    }
  }

  calculateBoundedBy(coords: number[]): number[][] {
    const delta = 0.2;
    return [
      [coords[0] - delta, coords[1] - delta],
      [coords[0] + delta, coords[1] + delta]
    ];
  }

  updateSearchBounds(): void {
    this.searchControl.options.set({
      boundedBy: this.calculateBoundedBy(this.userCoords)
    });
    console.log('Search bounds updated:', this.userCoords);
  }

  addPlacemark(coords: number[], title: string, description: string): void {
    const placemark = new ymaps.Placemark(coords, {
      balloonContentHeader: title,
      balloonContentBody: description,
      hintContent: title
    }, {
      preset: 'islands#blueDotIcon'
    });
    this.map.geoObjects.add(placemark);
  }
}