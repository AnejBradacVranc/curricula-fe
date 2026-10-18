export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  inviteToken: string;
  name?: string;
  surname?: string;
}

export interface LoginResponse {
  accessToken: string;
}
