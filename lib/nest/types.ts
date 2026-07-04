export type NestUser = {
  id: number;
  email: string;
  name: string | null;
  surname: string | null;
  schoolId: number;
  role: string;
};

export type NestAccessTokenResponse = {
  accessToken: string;
  expiresIn: number;
  tokenType: "Bearer";
};
