export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  description: string;
  createdAt: string;
  requirements: string[];
  interviews: any[];
}

export interface JobResponse {
  data: Job[];
}
