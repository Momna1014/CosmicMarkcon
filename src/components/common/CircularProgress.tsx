import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, moderateScale } from '../../theme';

interface CircularProgressProps {
  /** Progress value from 0 to 100 */
  progress: number;
  /** Size of the circular progress */
  size?: number;
  /** Width of the progress stroke */
  strokeWidth?: number;
  /** Color of the progress stroke */
  progressColor?: string;
  /** Color of the background circle */
  backgroundColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = memo(({
  progress,
  size = moderateScale(27),
  strokeWidth = moderateScale(3.5),
  progressColor = Colors.primary || '#4CAF50',
  backgroundColor = 'rgba(255, 255, 255, 0.2)',
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const radius = (size - strokeWidth) / 2.2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          // Start from top (-90 degrees)
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
    </View>
  );
});

CircularProgress.displayName = 'CircularProgress';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgress;
