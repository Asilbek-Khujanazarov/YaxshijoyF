import { Injectable } from '@angular/core';

declare const ymaps: any;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  initYandexMap(mapElement: HTMLDivElement, coords: [number, number], companyName: string): void {
    ymaps.ready(() => {
      const map = new ymaps.Map(mapElement, {
        center: coords,
        zoom: 15
      });

      const placemark = new ymaps.Placemark(coords, {
        hintContent: companyName || 'Company',
        balloonContent: companyName || 'Company'
      });

      map.geoObjects.add(placemark);
    });
  }
}