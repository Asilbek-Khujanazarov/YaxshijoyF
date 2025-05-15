import { Injectable } from '@angular/core';

declare const ymaps: any;

@Injectable({
  providedIn: 'root'
})
export class YandexMapService {
  private map: any;
  private searchControl: any;
  private userCoords: number[] = [41.311081, 69.240562]; // Default: Toshkent
  private lastSearchQuery: string | null = null;
  private selectedCategory: string | null = null;
  private isInitialLoad: boolean = true;

  constructor() {}

  setSelectedCategory(category: string | null): void {
    this.selectedCategory = category;
    this.lastSearchQuery = category;
  }

  // UserCoords ni yangilash uchun metod
  updateUserCoords(newCoords: number[]): void {
    this.userCoords = newCoords;
    this.updateSearchBounds();
    console.log('User coordinates updated:', this.userCoords);
  }

  initializeMap(searchResults: any[], callback: (results: any[]) => void): void {
    ymaps.ready(() => {
      this.map = new ymaps.Map(document.createElement('div'), {
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

      this.searchControl = new ymaps.control.SearchControl({
        options: {
          provider: 'yandex#search',
          boundedBy: this.calculateBoundedBy(this.userCoords),
          strictBounds: false,
          noPlacemark: true,
          results: 20
        }
      });

      this.setupSearchControl(searchResults, callback);

      ymaps.geolocation.get({
        provider: 'browser',
        mapStateAutoApply: true
      }).then((result: any) => {
        this.userCoords = result.geoObjects.get(0).geometry.getCoordinates();
        console.log('User location:', this.userCoords);
        this.map.setCenter(this.userCoords, 14);
        this.updateSearchBounds();
        this.performNearbySearch();
      }).catch((error: any) => {
        console.error('Geolocation error:', error);
      });

      this.isInitialLoad = false;
    }).catch((error: any) => {
      console.error('Yandex Maps API failed to load:', error);
    });
  }

  setMap(map: any): void {
    this.map = map;
  }

  getUserCoords(): number[] {
    return this.userCoords;
  }

  setupSearchControl(searchResults: any[], callback: (results: any[]) => void): void {
    this.searchControl.events.add('load', (e: any) => {
      if (!e.get('skip')) {
        const results = this.searchControl.getResultsArray();
        console.log('Search results array:', results);

        searchResults.length = 0;
        this.map.geoObjects.removeAll();

        results.forEach((item: any, index: number) => {
          try {
            const properties = item.properties.getAll();
            const geocoderMetaData = properties.metaDataProperty?.GeocoderMetaData || {};
            const companyMetaData = properties.CompanyMetaData || properties.companyMetaData || {};

            console.log(`Item ${index + 1} Properties:`, JSON.stringify(properties, null, 2));
            console.log(`Item ${index + 1} CompanyMetaData:`, JSON.stringify(companyMetaData, null, 2));

            const id = companyMetaData.id;
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
                id,
                address: companyMetaData.address || fullAddress,
                url,
                phones,
                categories,
                hours
              }
            };
            searchResults.push(resultItem);
            this.addPlacemark(coords, name, fullAddress);
          } catch (error) {
            console.error(`Error processing item ${index + 1}:`, error);
          }
        });

        console.log('Final searchResults:', searchResults);
        callback([...searchResults]);
      }
    });
  }

  performSearch(query: string): void {
    this.lastSearchQuery = query;
    this.selectedCategory = query;
    if (this.searchControl) {
      this.searchControl.search(query);
      console.log(`Searching for: ${query}`);
    } else {
      console.error('SearchControl is not initialized yet.');
    }
  }

  performNearbySearch(): void {
    const query = this.selectedCategory || this.lastSearchQuery;
    if (query) {
      this.searchControl.search(query);
      console.log(`Searching nearby for: ${query} at location: ${this.userCoords}`);
    } else {
      console.log('No search query or category available for nearby search.');
    }
  }

  calculateBoundedBy(coords: number[]): number[][] {
    const delta = 0.2; // ~20km radius
    return [
      [coords[0] - delta, coords[1] - delta],
      [coords[0] + delta, coords[1] + delta]
    ];
  }

  updateSearchBounds(): void {
    if (this.searchControl) {
      this.searchControl.options.set({
        boundedBy: this.calculateBoundedBy(this.userCoords)
      });
      console.log('Search bounds updated:', this.userCoords);
    }
  }

  addPlacemark(coords: number[], title: string, description: string): void {
    const placemark = new ymaps.Placemark(coords, {
      balloonContentHeader: title,
      balloonContentBody: description,
      hintContent: title
    }, {
      preset: 'isikirlands#blueDotIcon'
    });
    this.map.geoObjects.add(placemark);
  }
}