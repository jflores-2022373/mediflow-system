import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Declaración para que TypeScript reconozca el objeto global de Google
declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(
    public authService: AuthService, 
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initGoogleClient();
  }

  // Inicializa el sistema de Google Sign-In de forma segura
  initGoogleClient(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.initialize({
        client_id: '856400933592-cmkhp584h7heggcdjj1c7n24o18442id.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleResponse(response)
      });
    } else {
      // Reintenta si la librería de Google tarda unos milisegundos en cargar
      setTimeout(() => this.initGoogleClient(), 300);
    }
  }

  // Esta función se ejecuta al hacer clic en el botón personalizado fijo
  loginWithGoogle(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      // Abre el popup oficial de selección de cuentas de Google
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Si el navegador bloquea el prompt automático, invocamos el flujo manual o alertamos
          console.log('Prompt de Google no mostrado, usando flujo alternativo');
        }
      });
    } else {
      alert('El servicio de Google no está disponible en este momento. Verifica tu conexión.');
    }
  }

  // Maneja la respuesta del token que te da Google al iniciar sesión con éxito
  handleGoogleResponse(response: any): void {
    this.ngZone.run(() => {
      console.log('Token de Google recibido:', response.credential);
      // Aquí llamas a tu servicio para validar el token en el backend o entrar a la app
      this.authService.loginWithGoogle(); 
    });
  }

  onSubmit() {
    if (this.email && this.password) {
      this.authService.loginWithEmail(this.email, this.password);
    } else {
      alert('Por favor ingrese un correo y contraseña válidos.');
    }
  }
}