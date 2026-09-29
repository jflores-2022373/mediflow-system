import { ChangeDetectionStrategy, Component, AfterViewInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { GOOGLE_CLIENT_ID, apiErrorMessage } from '../config';

// Declaración para que TypeScript reconozca el objeto global de Google
declare var google: any;

const GOOGLE_INIT_MAX_RETRIES = 20;

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('googleButton') googleButton?: ElementRef<HTMLDivElement>;

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;
  googleReady: boolean = false;

  private retryTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    // Se difiere para no modificar el estado de la vista durante su propio ciclo de renderizado
    this.retryTimer = setTimeout(() => this.initGoogleClient());
  }

  ngOnDestroy(): void {
    clearTimeout(this.retryTimer);
  }

  // Inicializa Google Sign-In y dibuja el botón oficial;
  // reintenta mientras la librería de Google termina de cargar
  initGoogleClient(attempt: number = 0): void {
    if (typeof google !== 'undefined' && google.accounts?.id && this.googleButton) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleResponse(response)
      });

      const width = Math.min(400, this.googleButton.nativeElement.parentElement?.clientWidth || 320);
      google.accounts.id.renderButton(this.googleButton.nativeElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        locale: 'es',
        width
      });

      this.ngZone.run(() => this.googleReady = true);
    } else if (attempt < GOOGLE_INIT_MAX_RETRIES) {
      this.retryTimer = setTimeout(() => this.initGoogleClient(attempt + 1), 300);
    } else {
      this.ngZone.run(() => {
        this.errorMessage = 'No se pudo cargar el acceso con Google. Verifica tu conexión o usa tu correo.';
      });
    }
  }

  // Envía el token de Google al backend, que lo verifica antes de abrir sesión
  handleGoogleResponse(response: any): void {
    this.ngZone.run(() => {
      this.errorMessage = '';
      this.loading = true;
      this.authService.loginWithGoogle(response.credential).subscribe({
        next: () => this.loading = false,
        error: err => {
          this.loading = false;
          this.errorMessage = apiErrorMessage(err, 'No se pudo iniciar sesión con Google.');
        }
      });
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingrese un correo y contraseña válidos.';
      return;
    }

    this.loading = true;
    this.authService.loginWithEmail(this.email, this.password).subscribe({
      next: () => this.loading = false,
      error: err => {
        this.loading = false;
        this.errorMessage = apiErrorMessage(err, 'No se pudo iniciar sesión.');
      }
    });
  }
}
