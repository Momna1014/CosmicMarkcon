import React, {memo} from 'react';
import HoroscopeContent from './HoroscopeContent';
import {WEEKLY_HOROSCOPE} from '../../components/mock/mockData';

const WeeklyTab: React.FC = memo(() => {
  return <HoroscopeContent data={WEEKLY_HOROSCOPE} />;
});

export default WeeklyTab;
