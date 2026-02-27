import WebApp from '@twa-dev/sdk';

export function initTelegram() {
  WebApp.ready();
  WebApp.expand();
}

export function getInitData(): string {
  return WebApp.initData;
}

export function getUserInfo() {
  return WebApp.initDataUnsafe?.user;
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
  WebApp.HapticFeedback.impactOccurred(type);
}

export function showAlert(message: string) {
  WebApp.showAlert(message);
}

export function closeMiniApp() {
  WebApp.close();
}

export { WebApp };
