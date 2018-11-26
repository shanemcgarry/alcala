export interface SiteUser {
  _id: string;
  username: string;
  password: string;
  firstname: string;
  surname: string;
  loginToken: string;
  allowLogging: boolean;
  roles: string[];
  emailAddress: string;
  lastLogin?: Date;
}
