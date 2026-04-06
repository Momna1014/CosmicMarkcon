import React, {memo} from 'react';
import HoroscopeContent from './HoroscopeContent';
import {HoroscopeData} from '../../services/ConversationService';

type Props = {
  data: HoroscopeData;
};

const WeeklyTab: React.FC<Props> = memo(({data}) => {
  return <HoroscopeContent data={data} />;
});

export default WeeklyTab;
