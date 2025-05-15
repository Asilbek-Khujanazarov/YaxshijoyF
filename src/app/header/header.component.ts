import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ngModel uchun qo‘shildi
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule qo‘shildi
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() search = new EventEmitter<string>();
  searchQuery: string = '';
  user: any = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.user = response;
        console.log('Foydalanuvchi ma\'lumotlari:', this.user);
      },
      error: (err) => {
        console.error('Foydalanuvchi ma\'lumotlarini olishda xato:', err);
        this.user = null;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.search.emit(this.searchQuery);
    }
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.user = null;
        console.log('Foydalanuvchi tizimdan chiqdi.');
      },
      error: (err) => {
        console.error('Chiqishda xato:', err);
      }
    });
  }
}