import keys from 'lodash.keys';

/** @license https://github.com/AddToCalendar/addtocalendar The MIT License (MIT) Copyright (c) 2015 AddToCalendar */
const atc_url = 'addtocalendar.com/atc/';
const atc_version = '1.5';
const generator = (eventsParams) => {
  eventsParams = eventsParams.map((eventParams, i) => {
    const eventParamsArray = keys(eventParams).map((paramName) => {
      let paramValue = eventParams[paramName];
      return `e[${i}][${paramName}]=${encodeURIComponent(paramValue)}`;
    });
    return eventParamsArray.join('&');
  });

  const utz = (-(new Date()).getTimezoneOffset().toString());

  const urlParameters = [
    `utz=${utz}`,
    `uln=${navigator.language}`,
    `vjs=${atc_version}`
  ].concat(eventsParams);

  return `https://${atc_url}outlook?${urlParameters.join('&')}`;
};

export default generator;
