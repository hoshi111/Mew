import { Validators } from '@angular/forms';

export const LoginForm = {
  identifier: '',
  password: ''
};

export const Login = {
  email: ['', [Validators.required, Validators.email]],
  password: ['', Validators.required]
};