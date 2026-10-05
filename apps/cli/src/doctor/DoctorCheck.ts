export type DoctorStatus = "ok" | "warn" | "fail";

export type DoctorCheck = {
  readonly name: string;
  readonly status: DoctorStatus;
  readonly detail: string;
};
