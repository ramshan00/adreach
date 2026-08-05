export type RegistrationResponse = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
};
