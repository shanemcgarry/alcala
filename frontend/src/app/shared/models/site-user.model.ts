export interface SiteUser {
  _id: string;
  username: string;
  password: string;
  firstname: string;
  surname: string;
  loginToken: string;
  useDashboard: any;
  roles: string[];
}