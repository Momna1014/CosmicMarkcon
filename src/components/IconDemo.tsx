import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';

/**
 * Icon Demo Component
 * 
 * Demonstrates usage of react-native-vector-icons
 * Shows examples from different icon families
 */
const IconDemo: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Vector Icons Demo</Text>
      <Text style={styles.subtitle}>
        react-native-vector-icons is fully configured!
      </Text>

      {/* Material Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Icons</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Icon name="home" size={30} color="#4CAF50" />
            <Text style={styles.iconLabel}>home</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="favorite" size={30} color="#E91E63" />
            <Text style={styles.iconLabel}>favorite</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="settings" size={30} color="#9E9E9E" />
            <Text style={styles.iconLabel}>settings</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="search" size={30} color="#2196F3" />
            <Text style={styles.iconLabel}>search</Text>
          </View>
        </View>
      </View>

      {/* FontAwesome */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FontAwesome</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <FontAwesome name="user" size={30} color="#FF9800" />
            <Text style={styles.iconLabel}>user</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome name="star" size={30} color="#FFC107" />
            <Text style={styles.iconLabel}>star</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome name="heart" size={30} color="#F44336" />
            <Text style={styles.iconLabel}>heart</Text>
          </View>
          <View style={styles.iconItem}>
            <FontAwesome name="check-circle" size={30} color="#4CAF50" />
            <Text style={styles.iconLabel}>check-circle</Text>
          </View>
        </View>
      </View>

      {/* Ionicons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ionicons</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Ionicons name="mail-outline" size={30} color="#03A9F4" />
            <Text style={styles.iconLabel}>mail-outline</Text>
          </View>
          <View style={styles.iconItem}>
            <Ionicons name="notifications-outline" size={30} color="#FF5722" />
            <Text style={styles.iconLabel}>notifications</Text>
          </View>
          <View style={styles.iconItem}>
            <Ionicons name="person-outline" size={30} color="#9C27B0" />
            <Text style={styles.iconLabel}>person-outline</Text>
          </View>
          <View style={styles.iconItem}>
            <Ionicons name="call-outline" size={30} color="#4CAF50" />
            <Text style={styles.iconLabel}>call-outline</Text>
          </View>
        </View>
      </View>

      {/* Material Community Icons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Community Icons</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="account-circle" size={30} color="#3F51B5" />
            <Text style={styles.iconLabel}>account-circle</Text>
          </View>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="bell-ring" size={30} color="#FF9800" />
            <Text style={styles.iconLabel}>bell-ring</Text>
          </View>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="cart" size={30} color="#4CAF50" />
            <Text style={styles.iconLabel}>cart</Text>
          </View>
          <View style={styles.iconItem}>
            <MaterialCommunityIcons name="camera" size={30} color="#00BCD4" />
            <Text style={styles.iconLabel}>camera</Text>
          </View>
        </View>
      </View>

      {/* Feather */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feather</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <Feather name="download" size={30} color="#2196F3" />
            <Text style={styles.iconLabel}>download</Text>
          </View>
          <View style={styles.iconItem}>
            <Feather name="upload" size={30} color="#9C27B0" />
            <Text style={styles.iconLabel}>upload</Text>
          </View>
          <View style={styles.iconItem}>
            <Feather name="trash-2" size={30} color="#F44336" />
            <Text style={styles.iconLabel}>trash-2</Text>
          </View>
          <View style={styles.iconItem}>
            <Feather name="edit" size={30} color="#FF9800" />
            <Text style={styles.iconLabel}>edit</Text>
          </View>
        </View>
      </View>

      {/* AntDesign */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AntDesign</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <AntDesign name="like1" size={30} color="#2196F3" />
            <Text style={styles.iconLabel}>like1</Text>
          </View>
          <View style={styles.iconItem}>
            <AntDesign name="dislike1" size={30} color="#F44336" />
            <Text style={styles.iconLabel}>dislike1</Text>
          </View>
          <View style={styles.iconItem}>
            <AntDesign name="clockcircleo" size={30} color="#FF9800" />
            <Text style={styles.iconLabel}>clockcircleo</Text>
          </View>
          <View style={styles.iconItem}>
            <AntDesign name="checkcircleo" size={30} color="#4CAF50" />
            <Text style={styles.iconLabel}>checkcircleo</Text>
          </View>
        </View>
      </View>

      {/* Usage Example */}
      <View style={styles.codeSection}>
        <Text style={styles.codeSectionTitle}>Usage Example:</Text>
        <Text style={styles.codeText}>
          {`import Icon from 'react-native-vector-icons/MaterialIcons';

<Icon name="home" size={30} color="#4CAF50" />`}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📚 Full icon list: https://oblador.github.io/react-native-vector-icons/
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  iconItem: {
    alignItems: 'center',
    marginBottom: 12,
    width: '22%',
  },
  iconLabel: {
    fontSize: 11,
    color: '#616161',
    marginTop: 8,
    textAlign: 'center',
  },
  codeSection: {
    backgroundColor: '#263238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  codeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 13,
    color: '#4FC3F7',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
});

export default IconDemo;
