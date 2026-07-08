import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { User } from '../../../core/models/app.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  users: User[] = [];
  selectedUserId = '';
  loading = true;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly dataService: DataService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.redirectUser();
      return;
    }

    this.dataService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.selectedUserId = this.users[0]?.id ?? '';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load users.';
        this.loading = false;
      }
    });
  }

  login(): void {
    const user = this.users.find((item) => item.id === this.selectedUserId);
    if (!user) {
      this.errorMessage = 'Please select a user.';
      return;
    }

    this.authService.login(user);
    this.redirectUser();
  }

  private redirectUser(): void {
    if (this.authService.isAdmin) {
      this.router.navigate(['/admin/monitoring']);
      return;
    }

    this.router.navigate(['/employee/opportunities']);
  }
}
