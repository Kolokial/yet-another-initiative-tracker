export interface Envelope<T> {
  auth0Id: string;
  dateStamp: Date;
  message: T;
}
