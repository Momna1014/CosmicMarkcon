import React, {memo} from 'react';
import HoroscopeContent from './HoroscopeContent';
import {HoroscopeData} from '../../services/ConversationService';

type Props = {
  data: HoroscopeData;
};

const TodayTab: React.FC<Props> = memo(({data}) => {
  return <HoroscopeContent data={data} />;
});

export default TodayTab;
