import { convertEventParamsFromATC, formatTime, MS_IN_MINUTES } from './utils';

const generator = (eventsParams) => {
  eventsParams = convertEventParamsFromATC(eventsParams[0]);
  const eventDuration = eventsParams.end ?
    ((eventsParams.end.getTime() - eventsParams.start.getTime()) / MS_IN_MINUTES) :
    eventsParams.duration;

  // Yahoo dates are crazy, we need to convert the duration from minutes to hh:mm
  const yahooHourDuration = eventDuration < 600 ?
    '0' + Math.floor((eventDuration / 60)) :
    Math.floor((eventDuration / 60)) + '';

  const yahooMinuteDuration = eventDuration % 60 < 10 ?
    '0' + eventDuration % 60 :
    eventDuration % 60 + '';

  const yahooEventDuration = yahooHourDuration + yahooMinuteDuration;

  // Remove timezone from event time
  const st = formatTime(new Date(eventsParams.start - (eventsParams.start.getTimezoneOffset() *
    MS_IN_MINUTES))) || '';

  return encodeURI([
    'https://calendar.yahoo.com/?v=60&view=d&type=20',
    '&title=' + (eventsParams.title || ''),
    '&st=' + st,
    '&dur=' + (yahooEventDuration || ''),
    '&desc=' + (eventsParams.description || ''),
    '&in_loc=' + (eventsParams.address || '')
  ].join(''));
};

export default generator;
