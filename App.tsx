/**
 * MINIMAL VIDEO TEST APP
 * 
 * Purpose: Test react-native-video with Firebase
 * All other SDKs are disabled for isolation testing
 * 
 * See VIDEO_CRASH_DEBUG.md for step-by-step debugging plan
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';

const { width } = Dimensions.get('window');

// Local video from assets
const localVideo = require('./src/assets/asd.mp4');

export default function App() {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState('Loading...');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Text style={styles.title}>Video Test (Minimal)</Text>
      <Text style={styles.subtitle}>Firebase + Video Only</Text>
      
      <Text style={styles.status}>Status: {status}</Text>

      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={localVideo}
          style={styles.video}
          resizeMode="contain"
          paused={paused}
          repeat
          controls={true}
          onLoadStart={() => setStatus('Loading...')}
          onLoad={() => setStatus('Loaded')}
          onBuffer={({ isBuffering }) => setStatus(isBuffering ? 'Buffering...' : 'Playing')}
          onError={(e) => {
            console.log('[Video] Error:', e);
            setStatus(`Error: ${JSON.stringify(e.error)}`);
          }}
          onReadyForDisplay={() => setStatus('Playing!')}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setPaused(!paused)}>
          <Text style={styles.buttonText}>{paused ? '▶ Play' : '⏸ Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#03dac6' }]}
          onPress={() => videoRef.current?.seek(0)}>
          <Text style={styles.buttonText}>⏮ Restart</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.note}>
        If video plays = Firebase + Video works{'\n'}
        Next: Enable SDKs one by one
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#4ecca3',
    marginBottom: 20,
  },
  videoContainer: {
    width: width - 40,
    height: (width - 40) * 0.5625,
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
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 30,
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
});
