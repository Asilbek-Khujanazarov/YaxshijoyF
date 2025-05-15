import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail'
})
export class MaskEmailPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || !value.includes('@')) {
      return value || 'Anonim'; // Agar email noto'g'ri yoki bo'sh bo'lsa, 'Anonim' qaytaradi
    }

    const [username, domain] = value.split('@');
    const length = username.length;
    const maskLength = Math.ceil(length * 0.4); // 30% hisoblash
    const visiblePart = username.slice(0, length - maskLength);
    const maskedPart = '*'.repeat(maskLength);

    return `${visiblePart}${maskedPart}@${domain}`;
  }
}