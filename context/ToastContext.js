
import React, { createContext, useCallback, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from '../components/Toast';

const ToastContext = createContext(null);
const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message, variant = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <View
        pointerEvents="none"
        style={[styles.overlay, { bottom: insets.bottom + 78 }]}
      >
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} variant={t.variant} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
