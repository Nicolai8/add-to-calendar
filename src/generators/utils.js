import assign from 'lodash.assign';

export const MS_IN_MINUTES = 60 * 1000;

export const formatTime = (date) => {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

export const calculateEndTime = (eventParams) => {
  return eventParams.end ?
    formatTime(eventParams.end) :
    formatTime(new Date(eventParams.start.getTime() + (eventParams.duration * MS_IN_MINUTES)));
};

const fromStringDate = (date) => {
  if (date && typeof date === 'string') {
    date = new Date(date);
  }
  return date;
};

export const convertEventParamsFromATC = (eventParams) => {
  const start = fromStringDate(eventParams['date_start']);
  const end = fromStringDate(eventParams['date_end']);

  return assign({}, eventParams, {
    start,
    end
  });
};

export const isIE = () => {
  const input = document.createElement('input');
  const ie = (function () {
    if (window.ActiveXObject === undefined) return undefined;
    if (!document.addEventListener) return 8;
    if (!window.atob) return 9;
    //"!doc.body.dataset" is faster but the body is null when the DOM is not
    //ready. Anyway, an input tag needs to be created to check if IE is being
    //emulated
    if (!input.dataset) return 10;
    return 11;
  })();
  return ie;
};
