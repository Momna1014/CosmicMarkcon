/**
 * Global Alert Service
 * 
 * Provides a way to show alerts from anywhere in the app,
 * including from hooks and non-component code.
 */

import { AlertType, CustomAlertButton } from '../components/common/CustomAlert';

export interface AlertOptions {
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: CustomAlertButton[];
  autoHide?: boolean;
  autoHideDuration?: number;
}

type AlertListener = (options: AlertOptions | null) => void;

class AlertService {
  private listeners: Set<AlertListener> = new Set();

  subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(options: AlertOptions | null): void {
    this.listeners.forEach(listener => listener(options));
  }

  show(options: AlertOptions): void {
    this.notify(options);
  }

  hide(): void {
    this.notify(null);
  }

  success(title: string, message?: string, onOk?: () => void): void {
    this.show({
      type: 'success',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  }

  error(title: string, message?: string, onOk?: () => void): void {
    this.show({
      type: 'error',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  }

  warning(title: string, message?: string, buttons?: CustomAlertButton[]): void {
    this.show({
      type: 'warning',
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
    });
  }

  info(title: string, message?: string, onOk?: () => void): void {
    this.show({
      type: 'info',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  }
}

// Singleton instance
export const alertService = new AlertService();

export default alertService;
