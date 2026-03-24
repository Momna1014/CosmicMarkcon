import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Dimensions, Easing} from 'react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  type: 'orb' | 'dust';
  direction: 'up' | 'float';
}

const StarfieldAnimation: React.FC = () => {
  // Generate mystical particles
  const particles: Particle[] = Array.from({length: 40}, (_, i) => {
    const colors = [
      'rgba(194, 209, 243, 0.6)',   // Soft blue
      'rgba(221, 197, 96, 0.5)',    // Golden
      'rgba(156, 136, 255, 0.4)',   // Mystic purple
      'rgba(255, 215, 0, 0.3)',     // Light gold
      'rgba(147, 197, 253, 0.5)',   // Sky blue
    ];
    
    const types: ('orb' | 'dust')[] = ['orb', 'dust', 'dust'];
    const directions: ('up' | 'float')[] = ['up', 'float'];
    
    return {
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 8 + 2,
      duration: Math.random() * 8000 + 5000,
      delay: Math.random() * 5000,
      color: colors[Math.floor(Math.random() * colors.length)],
      type: types[Math.floor(Math.random() * types.length)],
      direction: directions[Math.floor(Math.random() * directions.length)],
    };
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Aurora/Glow Effect */}
      <View style={styles.auroraContainer}>
        <AuroraGlow />
      </View>
      
      {/* Floating Particles */}
      {particles.map(particle => (
        <FloatingParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
};

// Aurora Glow Effect Component
const AuroraGlow: React.FC = () => {
  const opacity1 = useRef(new Animated.Value(0.1)).current;
  const opacity2 = useRef(new Animated.Value(0.2)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity1, {
            toValue: 0.3,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity1, {
            toValue: 0.1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity2, {
            toValue: 0.4,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity2, {
            toValue: 0.2,
            duration: 5000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -30,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 6000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [opacity1, opacity2, translateY]);

  return (
    <>
      <Animated.View
        style={[
          styles.auroraGlow1,
          {opacity: opacity1, transform: [{translateY}]},
        ]}
      />
      <Animated.View
        style={[
          styles.auroraGlow2,
          {opacity: opacity2, transform: [{translateY: Animated.multiply(translateY, -1)}]},
        ]}
      />
    </>
  );
};

// Floating Particle Component
const FloatingParticle: React.FC<{particle: Particle}> = ({particle}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const moveDistance = particle.direction === 'up' ? -200 : 50;
    const xMovement = (Math.random() - 0.5) * 100;

    Animated.sequence([
      Animated.delay(particle.delay),
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 1000,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: moveDistance,
              duration: particle.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: xMovement,
              duration: particle.duration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: particle.duration,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(2000),
        ]),
      ),
    ]).start();
  }, [particle.delay, particle.duration, particle.direction, opacity, translateY, translateX, scale]);

  return (
    <Animated.View
      style={[
        particle.type === 'orb' ? styles.orb : styles.dust,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          opacity,
          transform: [{translateY}, {translateX}, {scale}],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  auroraContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  auroraGlow1: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 400,
    backgroundColor: 'rgba(156, 136, 255, 0.15)',
    borderRadius: 500,
    transform: [{scaleX: 1.5}],
    shadowColor: 'rgba(156, 136, 255, 0.5)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  auroraGlow2: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    right: -50,
    height: 350,
    backgroundColor: 'rgba(147, 197, 253, 0.1)',
    borderRadius: 500,
    transform: [{scaleX: 1.3}],
    shadowColor: 'rgba(147, 197, 253, 0.4)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.7,
    shadowRadius: 35,
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
    shadowColor: 'rgba(255, 215, 0, 0.8)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  dust: {
    position: 'absolute',
    borderRadius: 100,
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default StarfieldAnimation;
