export const PRODUCT_NAME = "Ohio Valley Grazing Exchange";

export const SERVICE_STATES = [
  "Ohio",
  "Pennsylvania",
  "Kentucky",
  "West Virginia",
] as const;

export type ServiceState = (typeof SERVICE_STATES)[number];

export function isServiceState(value: string | null | undefined): value is ServiceState {
  return !!value && (SERVICE_STATES as readonly string[]).includes(value);
}

/** Published Midwest Grazing Exchange states. Indiana is on the Ohio River and stays with that exchange. */
export const MIDWEST_EXCHANGE_STATES = [
  "Illinois",
  "Indiana",
  "Iowa",
  "Minnesota",
  "Missouri",
  "Wisconsin",
] as const;
