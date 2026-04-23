import { LoginRequest } from '@/interfaces/auth.interface';
import * as Yup from 'yup';

class AuthValidator {
  static loginSchema: Yup.ObjectSchema<LoginRequest> = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });
}

export default AuthValidator;
