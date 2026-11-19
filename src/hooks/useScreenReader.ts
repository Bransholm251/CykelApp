import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useScreenReaderEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setEnabled);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => sub.remove();
  }, []);
  return enabled;
}
