import { calculateEndTime, convertEventParamsFromATC, formatTime } from './utils';

const generator = (eventsParams) => {
  eventsParams = convertEventParamsFromATC(eventsParams[0]);
  const startTime = formatTime(eventsParams.start);
  const endTime = calculateEndTime(eventsParams);

  return encodeURI([
    'https://www.google.com/calendar/render',
    '?action=TEMPLATE',
    `&text=${eventsParams.title || ''}`,
    `&dates=${startTime || ''}/${endTime || ''}`,
    `&details=${eventsParams.description || ''}`,
    `&location=${eventsParams.address || ''}`,
    '&sprop=&sprop=name:'
  ].join(''));
};

export default generator;
