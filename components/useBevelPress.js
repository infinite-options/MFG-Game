import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const PRESS_DOWN_MS = 70;

// Shared "physical piece" press feedback: slides down onto its bevel edge on
// press, springs back up on release. Used by Button and Stepper.
export default function useBevelPress(edgeHeight) {
  const translateY = useSharedValue(0);

  const onPressIn = () => {
    translateY.value = withTiming(edgeHeight, { duration: PRESS_DOWN_MS });
  };

  const onPressOut = () => {
    translateY.value = withSpring(0, { damping: 12, stiffness: 400 });
  };

  return { translateY, onPressIn, onPressOut };
}
