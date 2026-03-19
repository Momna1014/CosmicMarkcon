import React, {memo} from 'react';
import HoroscopeContent from './HoroscopeContent';
import {TODAY_HOROSCOPE} from './mockData';

const TodayTab: React.FC = memo(() => {
  return <HoroscopeContent data={TODAY_HOROSCOPE} />;
});

export default TodayTab;
