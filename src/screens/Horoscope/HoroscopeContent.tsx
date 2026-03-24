import React, {memo} from 'react';
import {View, Text, ImageBackground, StyleSheet} from 'react-native';
import {styles} from './styles';
import {HoroscopeData} from '../../components/mock/mockData';
import {moderateScale, radiusScale} from '../../theme';

// Icons
import CosmicOverviewIcon from '../../assets/icons/horoscope_icons/cosmic_overview.svg';
import LoveRelationshipIcon from '../../assets/icons/horoscope_icons/love_relationship.svg';
import PathPurposeIcon from '../../assets/icons/horoscope_icons/path_purpose.svg';
import VitalityIcon from '../../assets/icons/horoscope_icons/vitality.svg';
import ColourIcon from '../../assets/icons/horoscope_icons/colour.svg';
import NumberIcon from '../../assets/icons/horoscope_icons/number.svg';
import EnergeticIcon from '../../assets/icons/horoscope_icons/energetic.svg';

// Background images
const EmbraceBackground = require('../../assets/icons/horoscope_icons/embrace_background.png');
const ReleaseBackground = require('../../assets/icons/horoscope_icons/release_background.png');

interface HoroscopeContentProps {
  data: HoroscopeData;
}

// Icon mapper
const getIcon = (iconName: string, color: string, size?: number) => {
  const iconSize = size || moderateScale(40);
  const props = {width: iconSize, height: iconSize, color};

  switch (iconName) {
    case 'cosmic_overview':
      return <CosmicOverviewIcon {...props} />;
    case 'love_relationship':
      return <LoveRelationshipIcon {...props} />;
    case 'path_purpose':
      return <PathPurposeIcon {...props} />;
    case 'vitality':
      return <VitalityIcon {...props} />;
    default:
      return null;
  }
};

const HoroscopeContent: React.FC<HoroscopeContentProps> = memo(({data}) => {
  // Separate Cosmic Overview from other sections
  const cosmicOverview = data.sections.find(s => s.id === 'cosmic_overview');
  const otherSections = data.sections.filter(s => s.id !== 'cosmic_overview');

  return (
    <View>
      {/* Cosmic Overview - Displayed Separately */}
      {cosmicOverview && (
        <View style={styles.cosmicOverviewCard}>
          <View style={styles.cosmicOverviewHeader}>
            <View style={styles.cosmicOverviewIconWrapper}>
              {getIcon(cosmicOverview.icon, cosmicOverview.iconColor, moderateScale(48))}
            </View>
            <Text style={styles.cosmicOverviewTitle}>
              {cosmicOverview.title}
            </Text>
          </View>
          <Text style={styles.cosmicOverviewDescription}>
            {cosmicOverview.description}
          </Text>
        </View>
      )}

      {/* Other Section Cards */}
      {otherSections.map(section => {

        const titleStyle = StyleSheet.create({
          title: {
            color: section.iconColor,
          },
        });

        return (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconWrapper,
                ]}>
                {getIcon(section.icon, section.iconColor)}
              </View>
              <Text style={[styles.sectionTitle, titleStyle.title]}>
                {section.title}
              </Text>
            </View>
            <Text style={styles.sectionDescription}>{section.description}</Text>
          </View>
        );
      })}

      {/* Lucky Elements Section */}
      <Text style={styles.luckyElementsTitle}>Your Lucky Elements</Text>
      <View style={styles.luckyElementsRow}>
        {data.luckyElements.map((element, index) => {
          const titleColor =
            element.type === 'embrace'
              ? 'rgba(52, 211, 153, 1)'
              : 'rgba(255, 107, 107, 1)';
          const titleStyle = StyleSheet.create({
            elementTitle: {
              color: titleColor,
            },
          });
          const cardBorderStyle = StyleSheet.create({
            border: {
              borderColor: titleColor,
            },
          });

          return (
            <View key={index} style={[styles.luckyElementCard, cardBorderStyle.border]}>
              <ImageBackground
                source={
                  element.type === 'embrace'
                    ? EmbraceBackground
                    : ReleaseBackground
                }
                style={styles.luckyElementBackground}
                imageStyle={{borderRadius: radiusScale(16)}}
                resizeMode="cover">
                <Text style={[styles.luckyElementTitle, titleStyle.elementTitle]}>
                  {element.title}
                </Text>
                <View style={styles.luckyElementList}>
                  {element.items.map((item, itemIndex) => (
                    <Text key={itemIndex} style={styles.luckyElementItem}>
                      <Text style={styles.bulletPoint}>• </Text>
                      {item}
                    </Text>
                  ))}
                </View>
              </ImageBackground>
            </View>
          );
        })}
      </View>

      {/* Celestial Alignment Section */}
      <Text style={styles.celestialTitle}>Celestial Alignment</Text>
      <View style={styles.celestialRow}>
        <View style={styles.celestialCard}>
          <View style={styles.celestialIconWrapper}>
            <ColourIcon
              width={moderateScale(40)}
              height={moderateScale(40)}
              color="#FFD700"
            />
          </View>
          <Text style={styles.celestialLabel}>Color</Text>
          <Text style={styles.celestialValue}>
            {data.celestialAlignment.color}
          </Text>
        </View>
        <View style={styles.celestialCard}>
          <View style={styles.celestialIconWrapper}>
            <NumberIcon
             width={moderateScale(40)}
              height={moderateScale(40)}
              color="#FFD700"
            />
          </View>
          <Text style={styles.celestialLabel}>Number</Text>
          <Text style={styles.celestialValue}>
            {data.celestialAlignment.number}
          </Text>
        </View>
        <View style={styles.celestialCard}>
          <View style={styles.celestialIconWrapper}>
            <EnergeticIcon
              width={moderateScale(40)}
              height={moderateScale(40)}
              color="#FFD700"
            />
          </View>
          <Text style={styles.celestialLabel}>Mood</Text>
          <Text style={styles.celestialValue}>
            {data.celestialAlignment.mood}
          </Text>
        </View>
      </View>
    </View>
  );
});

export default HoroscopeContent;
