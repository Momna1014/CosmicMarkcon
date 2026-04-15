/**
 * Video Screen
 *
 * Demonstrates react-native-video working with Firebase
 * Uses local video from assets
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video, { VideoRef } from 'react-native-video';
import { useTheme } from '../../theme/ThemeProvider';

const { width } = Dimensions.get('window');

// Local video from assets
const localVideo = require('../../assets/asd.mp4');

const VideoScreen: React.FC = () => {
  const theme = useTheme();
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('Loading...');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Video Player
      </Text>

      <Text style={[styles.status, { color: theme.colors.textSecondary }]}>
        Status: {status}
      </Text>

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={localVideo}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          repeat
          controls={true}
          onLoadStart={() => {
            setStatus('Loading...');
          }}
          onLoad={() => {
            setStatus('Ready');
          }}
          onBuffer={({ isBuffering }) => {
            setStatus(isBuffering ? 'Buffering...' : 'Playing');
          }}
          onError={e => {
            console.log('[Video] Error:', e);
            setStatus(`Error: ${e.error?.code || 'Unknown'}`);
          }}
          onReadyForDisplay={() => {
            setStatus('Playing');
          }}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => setPaused(!paused)}
        >
          <Text style={styles.buttonText}>{paused ? '▶ Play' : '⏸ Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.secondary }]}
          onPress={() => videoRef.current?.seek(0)}
        >
          <Text style={styles.buttonText}>⏮ Restart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    marginBottom: 20,
  },
  videoContainer: {
    width: width - 32,
    height: (width - 32) * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VideoScreen;
