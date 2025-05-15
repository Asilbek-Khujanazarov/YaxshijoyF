import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YandexMapService } from '../services/yandex-map.service';

declare const ymaps: any;

@Component({
  selector: 'app-yandex-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './yandex-map.component.html',
  styleUrls: ['./yandex-map.component.css']
})
export class YandexMapComponent implements OnInit {
  constructor(private yandexMapService: YandexMapService) {}

  ngOnInit(): void {
    ymaps.ready(() => {
      const map = new ymaps.Map('map', {
        center: this.yandexMapService.getUserCoords(),
        zoom: 12,
        controls: ['geolocationControl']
      });

      map.behaviors.enable([
        'drag',
        'scrollZoom',
        'multiTouch',
        'dblClickZoom'
      ]);

      // Xarita o‘zgarishlarini kuzatish
      map.events.add('boundschange', () => {
        const newCenter = map.getCenter();
        this.yandexMapService.updateUserCoords(newCenter); // Yangi markazni yangilaymiz
        this.yandexMapService.performNearbySearch(); // Yaqin atrofdagi joylarni qidirish
      });

      const geolocationControl = map.controls.get('geolocationControl');
      geolocationControl.events.add('locationchange', (e: any) => {
        const newCoords = e.get('position');
        if (newCoords) {
          this.yandexMapService.updateUserCoords(newCoords); // Yangi joylashuvni yangilaymiz
          map.setCenter(newCoords, 14);
          this.yandexMapService.performNearbySearch(); // Yaqin atrofdagi joylarni qidirish
        }
      });

      this.yandexMapService.setMap(map); // Xaritani servisga o‘rnatamiz
    }).catch((error: any) => {
      console.error('Yandex Maps API failed to load:', error);
    });
  }
}