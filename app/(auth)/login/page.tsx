// Updated Login component with Material UI
// app/login/page.tsx
"use client";

import { MaterialPasswordField, MaterialTextField } from '@/components/common/CustomFields';
import { useLazyFetchUserQuery, useLoginMutation } from '@/features/auth/authApiService';
import { setCredentials } from '@/features/auth/authSlice';
import { saveEncryptedToken } from '@/helpers/encryptToken.helper';
import { useToast } from '@/hooks/useToast';
import { ErrorResponse } from '@/interfaces/root.interface';
import { useAppDispatch } from '@/lib/store';
import AuthValidator from '@/utils/validators/auth_validator';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LoginValues {
  email: string;
  password: string;
}

function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [login, { isLoading, isError: isLoginError, error: loginError, data: loginData, isSuccess: isLoginSuccess, reset: resetLogin }] = useLoginMutation();
  const [fetchUser, { isLoading: isUserLoading, isSuccess: userSuccess, isError: isFetchingUserError, error: fetchingUserError, data: userData, reset: resetFetchingUser }] = useLazyFetchUserQuery();

  const { showToast } = useToast();

  // UseEffect for handling login api error
  useEffect(() => {
    if (isLoginError) {
      showToast((loginError as ErrorResponse)?.data?.message ?? 'Error Logging In.', 'error');
      resetLogin();
    }
  }, [isLoginError, loginError, showToast, resetLogin]);

  // UseEffect for handling user api error
  useEffect(() => {
    if (isFetchingUserError) {
      showToast((fetchingUserError as ErrorResponse)?.data?.message ?? 'Error Logging In', 'error');
    }
    resetFetchingUser();
  }, [isFetchingUserError, fetchingUserError, showToast, resetFetchingUser]);

  const initialValues = {
    email: '',
    password: '',
  };

  const handleLogin = async (values: LoginValues, { setSubmitting }: FormikHelpers<LoginValues>) => {
    await login({ email: values.email, password: values.password }).unwrap();
    // Token will be automatically set in Redux state via extraReducers
    setSubmitting(false);
  };

  useEffect(() => {
    if (isLoginSuccess && loginData) {
      console.log("🚀 ~ Login ~ loginData:", loginData)
      fetchUser(loginData?.data?.accessToken);
    }
  }, [isLoginSuccess, loginData, fetchUser]);

  useEffect(() => {
    if (userSuccess && userData && loginData) {
      dispatch(setCredentials({ user: userData, token: loginData?.data?.accessToken }));
      saveEncryptedToken(loginData?.data?.accessToken);
      showToast('Login Successful', 'success');
      router.push('/admin');
    }
  }, [userSuccess, userData, loginData, dispatch, showToast, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        bgcolor: 'background.default'
      }}
    >
      {/* Desktop Side - Background Image */}
      {!isMobile && (
        <Box
          sx={{
            width: "100%",
            flex: 1,
            display: 'flex',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            // background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        >
          <Container maxWidth="sm">
            <Card
              elevation={24}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                border: '8px solid',
                borderColor: 'grey.900',
                position: 'relative',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      letterSpacing: 1
                    }}
                  >
                    AIMK Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Angels in my Kitchen Backend
                  </Typography>
                </Box>

                <Formik
                  initialValues={initialValues}
                  validationSchema={AuthValidator.loginSchema}
                  onSubmit={handleLogin}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Box sx={{ mb: 3 }}>
                        <MaterialTextField
                          label="Email"
                          name="email"
                          placeholder="Enter your email"
                          type="email"
                          fullWidth
                        />
                      </Box>

                      <Box sx={{ mb: 4 }}>
                        <MaterialPasswordField
                          name="password"
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPassword ? 'hide password' : 'show password'}
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </Box>

                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || isLoading || isUserLoading}
                        endIcon={(!isLoading && !isUserLoading) && <ArrowForwardIcon />}
                        fullWidth
                        size="large"
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: 16,
                          textTransform: 'none',
                          fontWeight: 500,
                        }}
                      >
                        {isLoading || isUserLoading ? (
                          <CircularProgress color="inherit" size={24} />
                        ) : (
                          'Login'
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          </Container>
        </Box>
      )}

      {/* Mobile View */}
      {isMobile && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                  }}
                >
                  AIMK Admin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Angels in my Kitchen
                </Typography>
              </Box>

              <Formik
                initialValues={initialValues}
                validationSchema={AuthValidator.loginSchema}
                onSubmit={handleLogin}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Box sx={{ mb: 2 }}>
                      <MaterialTextField
                        label="Email"
                        name="email"
                        placeholder="Enter your email"
                        type="email"
                        fullWidth
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <MaterialPasswordField
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={showPassword ? 'hide password' : 'show password'}
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isSubmitting || isLoading || isUserLoading}
                      endIcon={(!isLoading && !isUserLoading) && <ArrowForwardIcon />}
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: 16,
                        textTransform: 'none',
                      }}
                    >
                      {isLoading || isUserLoading ? (
                        <CircularProgress color="inherit" size={24} />
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default Login;