import {SvgProps} from 'react-native-svg';

// Transit item data type
export interface TransitData {
  id: string;
  name: string;
  subtext: string;
  description: string;
  Icon: React.FC<SvgProps>;
  color: string;
}

// Cosmic guide data type
export interface CosmicGuideData {
  id: string;
  title: string;
  Icon: React.FC<SvgProps>;
  bgColor: string;
}
