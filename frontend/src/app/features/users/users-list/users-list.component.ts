import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import type { User } from '../../../core/models/api.types';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);

  users = signal<User[]>([]);
  page = signal(1);
  totalPages = signal(1);
  total = signal(0);
  loading = signal(false);
  errorMessage = signal('');

  meta = computed(() => ({
    page: this.page(),
    totalPages: this.totalPages(),
    total: this.total(),
  }));

  constructor() {
    this.loadPage(1);
  }

  loadPage(p: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.userService.getUsers(p, 10).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.ok && res.data) {
          this.users.set(res.data.data);
          this.page.set(res.data.meta.page);
          this.totalPages.set(res.data.meta.pages);
          this.total.set(res.data.meta.total);
        } else {
          this.errorMessage.set(res.message ?? 'Error al cargar usuarios');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message ?? 'Error de conexión. Intenta de nuevo.'
        );
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
