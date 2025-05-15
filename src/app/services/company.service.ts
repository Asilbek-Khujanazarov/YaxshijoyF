import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companyRatings: { [key: string]: { rating: number, reviewCount: number } } = {};
  private companyImages: { [key: string]: any[] } = {};
  private reviews: { [key: string]: any[] } = {};

  constructor(private http: HttpClient) {}

  fetchDataForResults(searchResults: any[]): Observable<void> {
    const ratingRequests = searchResults.map(item => {
      const companyId = item.companyMetaData?.id;
      if (companyId && !this.companyRatings[companyId]) {
        return this.http.get<any>(`${environment.baseUrl}/CompanyRatings/${companyId}`, { withCredentials: true })
          .pipe(
            tap(response => {
              this.companyRatings[companyId] = {
                rating: response.rating || 0,
                reviewCount: response.reviewCount || 0
              };
            }),
            catchError(error => {
              console.error(`Reytingni olishda xato (${companyId}):`, error);
              this.companyRatings[companyId] = { rating: 0, reviewCount: 0 };
              return of(null);
            })
          );
      }
      return of(null);
    });

    const imageRequests = searchResults.map(item => {
      const companyId = item.companyMetaData?.id;
      if (companyId && !this.companyImages[companyId]) {
        return this.http.get<any[]>(`${environment.baseUrl}/images/${companyId}`, { withCredentials: true })
          .pipe(
            tap(images => {
              this.companyImages[companyId] = images || [];
            }),
            catchError(error => {
              console.error(`Rasmlarni olishda xato (${companyId}):`, error);
              this.companyImages[companyId] = [];
              return of([]);
            })
          );
      }
      return of([]);
    });

    return forkJoin([...ratingRequests, ...imageRequests]).pipe(
      map(() => undefined)
    );
  }

  fetchReviews(companyId: string): Observable<any[]> {
    if (this.reviews[companyId]) {
      return of(this.reviews[companyId]);
    }
    return this.http.get<any[]>(`${environment.baseUrl}/reviews/${companyId}`, { withCredentials: true })
      .pipe(
        tap(reviews => {
          this.reviews[companyId] = reviews.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
        catchError(error => {
          console.error(`Sharhlarni olishda xato (${companyId}):`, error);
          this.reviews[companyId] = [];
          return of([]);
        })
      );
  }

  fetchImages(companyId: string): Observable<any[]> {
    if (this.companyImages[companyId]) {
      return of(this.companyImages[companyId]);
    }
    return this.http.get<any[]>(`${environment.baseUrl}/images/${companyId}`, { withCredentials: true })
      .pipe(
        tap(images => {
          this.companyImages[companyId] = images || [];
        }),
        catchError(error => {
          console.error(`Rasmlarni olishda xato (${companyId}):`, error);
          this.companyImages[companyId] = [];
          return of([]);
        })
      );
  }

  fetchCompanyRating(companyId: string): Observable<{ rating: number, reviewCount: number }> {
    if (this.companyRatings[companyId]) {
      return of(this.companyRatings[companyId]);
    }
    return this.http.get<any>(`${environment.baseUrl}/CompanyRatings/${companyId}`, { withCredentials: true })
      .pipe(
        tap(response => {
          this.companyRatings[companyId] = {
            rating: response.rating || 0,
            reviewCount: response.reviewCount || 0
          };
        }),
        map(response => ({
          rating: response.rating || 0,
          reviewCount: response.reviewCount || 0
        })),
        catchError(error => {
          console.error(`Reytingni olishda xato (${companyId}):`, error);
          this.companyRatings[companyId] = { rating: 0, reviewCount: 0 };
          return of({ rating: 0, reviewCount: 0 });
        })
      );
  }

  uploadImage(companyId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('CompanyId', companyId);
    formData.append('Image', file);

    return this.http.post(`${environment.baseUrl}/images`, formData, { withCredentials: true })
      .pipe(
        tap(response => {
          // Backenddan qaytgan yangi rasmni companyImages ga qo'shamiz
          const newImage = response; // Backenddan qaytgan rasm obyekti
          if (!this.companyImages[companyId]) {
            this.companyImages[companyId] = [];
          }
          this.companyImages[companyId].push(newImage);
        }),
        catchError(error => {
          console.error('Rasm yuklashda xato:', error);
          throw error;
        })
      );
  }

  submitReview(companyId: string, review: { comment: string, rating: number, images: File[] }): Observable<any> {
    const formData = new FormData();
    formData.append('Comment', review.comment);
    formData.append('Rating', review.rating.toString());
    formData.append('CompanyId', companyId);
    if (review.images && review.images.length > 0) {
      review.images.forEach((image, index) => {
        formData.append(`Images`, image);
      });
    }

    return this.http.post(`${environment.baseUrl}/reviews`, formData, { withCredentials: true })
      .pipe(
        catchError(error => {
          console.error('Sharh qoldirishda xato:', error);
          throw error;
        })
      );
  }

  deleteImage(imageId: string, companyId: string): Observable<void> {
    return this.http.delete(`${environment.baseUrl}/images/${imageId}`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.companyImages[companyId] = this.companyImages[companyId]?.filter(img => img.id !== imageId) || [];
        }),
        catchError(error => {
          console.error('Rasmni o‘chirishda xato:', error);
          throw error;
        }),
        map(() => undefined)
      );
  }

  getRating(companyId: string): number {
    return this.companyRatings[companyId]?.rating || 0;
  }

  getReviewCount(companyId: string): number {
    return this.companyRatings[companyId]?.reviewCount || 0;
  }

  getFirstImageUrl(companyId: string): string {
    const images = this.companyImages[companyId] || [];
    return images.length > 0 ? `http://localhost:5233${images[0].imageUrl}` : '/assets/placeholder-image.jpg';
  }

  getFilledStars(companyId: string): number {
    return Math.round(this.getRating(companyId));
  }

  clearCache(): void {
    this.companyRatings = {};
    this.companyImages = {};
    this.reviews = {};
  }
}