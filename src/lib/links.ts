import * as WebBrowser from 'expo-web-browser';
import { colors } from '@/theme';
import { FIND_MECHANIC_URL } from '@/config';

export const openInApp = (url: string) =>
  WebBrowser.openBrowserAsync(url, { controlsColor: colors.accent, toolbarColor: colors.background });

export const findMechanic = () => openInApp(FIND_MECHANIC_URL);
