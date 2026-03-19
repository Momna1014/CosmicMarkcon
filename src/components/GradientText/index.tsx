import React, {memo} from 'react';
import {Text, TextStyle, StyleProp} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

interface GradientTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  colors?: string[];
  start?: {x: number; y: number};
  end?: {x: number; y: number};
}

const GradientText: React.FC<GradientTextProps> = memo(({
  children,
  style,
  colors = ['#EEDF9B', '#DDC560'],
  start = {x: 0, y: 0},
  end = {x: 1, y: 0},
}) => {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, {backgroundColor: 'transparent'}]}>
          {children}
        </Text>
      }>
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style, {opacity: 0}]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
});

GradientText.displayName = 'GradientText';

export default GradientText;
