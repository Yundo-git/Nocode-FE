export type SystemSettings = {

  readonly pingIntervalSec: number;
  readonly failThreshold: number;
  readonly logRetentionDays: number;
};

export const DEFAULT_SETTINGS: SystemSettings = {
  pingIntervalSec: 15,
  failThreshold: 3,
  logRetentionDays: 90,
};
