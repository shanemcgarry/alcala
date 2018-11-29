export interface PosterSection {
  title: string;
  description: string;
  boundaryObjects: string[];
}

export interface PosterModel {
  _id: string;
  userID: string;
  title: string;
  description: string;
  sections: PosterSection[];
  dateCreated: Date;
}
