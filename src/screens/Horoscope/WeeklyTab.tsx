import React, {memo} from 'react';
import HoroscopeContent from './HoroscopeContent';
import {WEEKLY_HOROSCOPE} from './mockData';

const WeeklyTab: React.FC = memo(() => {
  return <HoroscopeContent data={WEEKLY_HOROSCOPE} />;
});

export default WeeklyTab;
