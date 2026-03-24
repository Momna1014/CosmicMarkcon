import React, {memo} from 'react';
import HoroscopeContent from './HoroscopeContent';
import {TOMORROW_HOROSCOPE} from '../../components/mock/mockData';

const TomorrowTab: React.FC = memo(() => {
  return <HoroscopeContent data={TOMORROW_HOROSCOPE} />;
});

export default TomorrowTab;
