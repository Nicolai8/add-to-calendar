import { calculateEndTime, convertEventParamsFromATC, formatTime, isIE } from './utils';

const generator = (eventsParams) => {
  eventsParams = convertEventParamsFromATC(eventsParams[0]);
  const startTime = formatTime(eventsParams.start);
  const endTime = calculateEndTime(eventsParams);

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'URL:' + document.URL,
    'DTSTART:' + (startTime || ''),
    'DTEND:' + (endTime || ''),
    'SUMMARY:' + (eventsParams.title || ''),
    'DESCRIPTION:' + (eventsParams.description || ''),
    'LOCATION:' + (eventsParams.address || ''),
    'END:VEVENT',
    'END:VCALENDAR'].join('\n');

  if (isIE()) {
    return ics;
  }
  return encodeURI(
    `data:text/calendar;charset=utf8,${ics}`);
};

export default generator;
