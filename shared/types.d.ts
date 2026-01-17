export type User = {
  id: number;
  username: string;
  password: string;
  fullname: string;
  judgeid: string;
  email: string | null;
  adminlvl: number;
  role: string;
  created_at: string;
};

export type Tournament = {
  id: number;
  tournament_id: string;
  name: string;
  teams: Team[];
};

export type Team = {
  id: number;
  name: string;
  debaters?: Debater[];
};

export type Debater = {
  id: number;
  team: string;
  name: string;
  surname: string;
};
