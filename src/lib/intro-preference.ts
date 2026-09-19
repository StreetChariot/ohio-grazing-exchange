export const INTRO_COOKIE = "ovge-intro";
export const INTRO_COLLAPSED = "collapsed";
export const INTRO_DISMISSED = "dismissed";

export function writeIntroCookie(value: typeof INTRO_COLLAPSED | typeof INTRO_DISMISSED) {
  const lifetime = value === INTRO_DISMISSED ? "; Max-Age=31536000" : "";
  document.cookie = `${INTRO_COOKIE}=${value}; Path=/; SameSite=Lax${lifetime}`;
}

export function clearIntroCookie() {
  document.cookie = `${INTRO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
