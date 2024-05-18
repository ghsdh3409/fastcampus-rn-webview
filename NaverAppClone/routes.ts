export const RouteNames = {
  HOME_TAB: 'home-tab' as const,
  HOME: 'home' as const,
  SHOPPNIG: 'shopping' as const,
  BROWSER: 'browser' as const,
};

export type RootStackParamList = {
  [RouteNames.HOME_TAB]: undefined;
  [RouteNames.BROWSER]: undefined;
};
