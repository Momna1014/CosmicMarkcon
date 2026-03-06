import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import CustomAlert, { CustomAlertProps, CustomAlertButton } from '../components/common/CustomAlert';
import alertService, { AlertOptions } from '../services/alertService';

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
  showSuccessAlert: (title: string, message?: string, onOk?: () => void) => void;
  showErrorAlert: (title: string, message?: string, onOk?: () => void) => void;
  showWarningAlert: (title: string, message?: string, buttons?: CustomAlertButton[]) => void;
  showInfoAlert: (title: string, message?: string, onOk?: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertState, setAlertState] = useState<Omit<CustomAlertProps, 'onDismiss'> & { visible: boolean }>({
    visible: false,
    title: '',
    type: 'info',
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      visible: true,
      ...options,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  // Subscribe to global alertService
  useEffect(() => {
    const unsubscribe = alertService.subscribe((options) => {
      if (options) {
        showAlert(options);
      } else {
        hideAlert();
      }
    });
    return unsubscribe;
  }, [showAlert, hideAlert]);

  const showSuccessAlert = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'success',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  }, [showAlert]);

  const showErrorAlert = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'error',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  }, [showAlert]);

  const showWarningAlert = useCallback((title: string, message?: string, buttons?: CustomAlertButton[]) => {
    showAlert({
      type: 'warning',
      title,
      message,
      buttons: buttons || [{ text: 'OK', style: 'default' }],
    });
  }, [showAlert]);

  const showInfoAlert = useCallback((title: string, message?: string, onOk?: () => void) => {
    showAlert({
      type: 'info',
      title,
      message,
      buttons: [{ text: 'OK', style: 'default', onPress: onOk }],
    });
  }, [showAlert]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        hideAlert,
        showSuccessAlert,
        showErrorAlert,
        showWarningAlert,
        showInfoAlert,
      }}
    >
      {children}
      <CustomAlert
        visible={alertState.visible}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        autoHide={alertState.autoHide}
        autoHideDuration={alertState.autoHideDuration}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export default AlertProvider;
