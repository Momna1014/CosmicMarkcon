import {TransitData, CosmicGuideData} from './types';
import {TRANSIT_COLORS, GUIDE_ICON_COLORS} from '../../screens/Home/styles';

// Transit Icons
import MercuryIcon from '../../assets/icons/home_icons/mercury.svg';
import VenusIcon from '../../assets/icons/home_icons/venus.svg';
import MarsIcon from '../../assets/icons/home_icons/mars.svg';
import JupiterIcon from '../../assets/icons/home_icons/jupiter.svg';
import SaturnIcon from '../../assets/icons/home_icons/saturn.svg';
import UranusIcon from '../../assets/icons/home_icons/uranus.svg';
import NeptuneIcon from '../../assets/icons/home_icons/neptune.svg';
import PlutoIcon from '../../assets/icons/home_icons/pluto.svg';

// Cosmic Guide Icons
import UnderstandingTransitIcon from '../../assets/icons/home_icons/understanding_transit.svg';
import MoonPhases101Icon from '../../assets/icons/home_icons/Moon_pjase_101.svg';
import RetrogradeSurvivalIcon from '../../assets/icons/home_icons/restograde_survival.svg';
import HumanDesignIntroIcon from '../../assets/icons/home_icons/human_design_intro.svg';

// Transit data
export const TRANSITS_DATA: TransitData[] = [
  {id: 'mercury', name: 'Mercury', subtext: 'In Sagittarius', Icon: MercuryIcon, color: TRANSIT_COLORS.mercury},
  {id: 'venus', name: 'Venus', subtext: 'In Capricorn', Icon: VenusIcon, color: TRANSIT_COLORS.venus},
  {id: 'mars', name: 'Mars', subtext: 'In Pisces', Icon: MarsIcon, color: TRANSIT_COLORS.mars},
  {id: 'jupiter', name: 'Jupiter', subtext: 'In Cancer', Icon: JupiterIcon, color: TRANSIT_COLORS.jupiter},
  {id: 'saturn', name: 'Saturn', subtext: 'In Aquarius', Icon: SaturnIcon, color: TRANSIT_COLORS.saturn},
  {id: 'uranus', name: 'Uranus', subtext: 'In Taurus', Icon: UranusIcon, color: TRANSIT_COLORS.uranus},
  {id: 'neptune', name: 'Neptune', subtext: 'In Pisces', Icon: NeptuneIcon, color: TRANSIT_COLORS.neptune},
  {id: 'pluto', name: 'Pluto', subtext: 'In Aquarius', Icon: PlutoIcon, color: TRANSIT_COLORS.pluto},
];

// Cosmic guides data
export const COSMIC_GUIDES_DATA: CosmicGuideData[] = [
  {id: 'understanding_transit', title: 'Understanding Transit', Icon: UnderstandingTransitIcon, bgColor: GUIDE_ICON_COLORS.understanding_transit},
  {id: 'moon_phases', title: 'Moon Phases 101', Icon: MoonPhases101Icon, bgColor: GUIDE_ICON_COLORS.moon_phases},
  {id: 'retrograde', title: 'Retrograde Survival', Icon: RetrogradeSurvivalIcon, bgColor: GUIDE_ICON_COLORS.retrograde},
  {id: 'human_design', title: 'Human Design Intro', Icon: HumanDesignIntroIcon, bgColor: GUIDE_ICON_COLORS.human_design},
];

// Feature card backgrounds
export const SynastryBackground = require('../../assets/icons/home_icons/synastry_background.png');
export const ChiromancyBackground = require('../../assets/icons/home_icons/chiromancy_background.png');
export const DailyEnergyBackground = require('../../assets/icons/home_icons/daily_energy_background.png');

// Feature card icons
export {default as SynastryHeartIcon} from '../../assets/icons/home_icons/synastry_heart.svg';
export {default as ChiromancyHandIcon} from '../../assets/icons/home_icons/chiromancy_hand.svg';
