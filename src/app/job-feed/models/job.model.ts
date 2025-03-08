export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
}

export interface JobResponse {
  data: Job[];
}
