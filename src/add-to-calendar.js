import getBrowserLocale from 'browser-locale';
import 'nodelist-foreach-polyfill';
import * as FileSaver from 'file-saver';
import assign from 'lodash.assign';
import keys from 'lodash.keys';
import 'string.prototype.startswith';

import icsGenerator from './generators/ics';
import googleGenerator from './generators/google';
import yahooGenerator from './generators/yahoo';
import { isIE } from './generators/utils';

import enTranslation from './translations/en';
import cnTranslation from './translations/cn';
import deTranslation from './translations/de';
import esTranslation from './translations/es';
import frTranslation from './translations/fr';
import jpTranslation from './translations/jp';
import ruTranslation from './translations/ru';

const languages = {
  cn: assign({}, enTranslation, cnTranslation),
  de: assign({}, enTranslation, deTranslation),
  en: enTranslation,
  es: assign({}, enTranslation, esTranslation),
  fr: assign({}, enTranslation, frTranslation),
  jp: assign({}, enTranslation, jpTranslation),
  ru: assign({}, enTranslation, ruTranslation)
};

const globalVariableName = 'atcOverrides';
const addToCalendarClassName = 'addtocalendar';
const defaultLanguage = 'en';

const calendarTypes = {
  'iCalendar': 'iCalendar',
  'googleCalendar': 'googleCalendar',
  'outlook': 'outlook',
  'yahoo': 'yahoo'
};

const calendarGenerators = {
  [calendarTypes.iCalendar]: icsGenerator,
  [calendarTypes.googleCalendar]: googleGenerator,
  [calendarTypes.outlook]: icsGenerator,
  [calendarTypes.yahoo]: yahooGenerator,
};

const loadSettings = (element, settingsOverrides) => {
  let settings = {
    'language': 'auto',
    'calendars': keys(calendarTypes),
  };

  let translationOverrides = false;

  if (globalVariableName in window) {
    settings = assign({}, settings, window[globalVariableName]);
  }

  const atcAttributes = Array.prototype.filter.call(element.attributes,
    (attribute) => attribute.name.startsWith('data-atc-'));

  atcAttributes.forEach((attribute) => {
    const settingName = attribute.name.replace('data-atc-', '');

    if (settingName === 'translations') {
      translationOverrides = JSON.parse(attribute.value);
    } else {
      settings[settingName] = attribute.value;
    }
  });

  if (settingsOverrides) {
    settings = assign({}, settings, settingsOverrides);
  }

  const browserLanguage = getBrowserLocale().substr(0, 2);
  if (settings.language === 'auto') {
    settings.language = browserLanguage;
  }
  settings.language = languages[settings.language] ? settings.language : defaultLanguage;

  let translations = assign({}, languages[settings.language], settings.translations || {});
  if (translationOverrides) {
    translations = assign({}, translations, translationOverrides);
  }

  settings.translations = translations;

  return settings;
};

const getCalendarParameters = (element) => {
  const events = element.querySelectorAll('var.atc_event');

  return Array.prototype.map.call(events, (event) => {
    const eventParams = event.querySelectorAll('var');

    const result = {};
    eventParams.forEach((param) => {
      const paramName = param.className.replace('atc_', '');
      result[paramName] = param.innerHTML;
    });

    return result;
  });
};

const getCalendarLink = (settings, eventParams, element, calendarType) => {
  const calendarLinkId = element.id === '' ? '' : (`id="${element.id}_${calendarType}_link"`);
  const linkTitle = settings.translations[calendarType];

  // ics can't be downloaded in IE10-11 without hacks like in other browsers
  if (isIE() >= 10 && (calendarType === calendarTypes.outlook || calendarType === calendarTypes.iCalendar)) {
    return `<a ${calendarLinkId} class="atcb-item-link ${calendarType}" data-event='${JSON.stringify(eventParams)}'>${linkTitle}</a>`;
  }

  let generator = calendarGenerators[calendarType];
  if (!generator) {
    generator = icsGenerator;
    console.warn(`Generator for '${calendarType}' not found, will be used ics instead`);
    return '';
  }
  const event = generator(eventParams);
  return `<a ${calendarLinkId} class="atcb-item-link ${calendarType}" href="${event}" target="_blank" rel="nofollow">${linkTitle}</a>`;
};

const downloadIcs = (event) => {
  const ext = '.ics';
  const filename = 'event';
  let blob;
  if (isIE() < 11) {
    const bb = new MSBlobBuilder();
    bb.append(event);
    blob = bb.getBlob('text/x-vCalendar;charset=utf8');
  } else {
    blob = new Blob([event]);
  }
  FileSaver.saveAs(blob, filename + ext);
};

export const createCalendar = (element, settingsOverrides, eventParams) => {
  const settings = loadSettings(element, settingsOverrides);

  const ul = document.createElement('ul');
  ul.className = 'atcb-list';

  let dropdownLinks = '';
  settings.calendars.forEach((calendarType) => {
    eventParams = eventParams || getCalendarParameters(element);
    const link = getCalendarLink(settings, eventParams, element, calendarType);
    dropdownLinks += `<li class="atcb-item">${link}</li>`;
  });
  ul.innerHTML = dropdownLinks;

  let button = document.createElement('a');
  button.className = 'atcb-link';
  button.innerHTML = settings.translations.buttonText;
  button.id = element.id === '' ? '' : (`${element.id}_link`);
  button.tabIndex = 1;

  element.appendChild(button);
  element.appendChild(ul);
};

const applyIcsIEHandler = (link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const eventParams = JSON.parse(link.getAttribute('data-event'));
    const event = icsGenerator(eventParams);
    downloadIcs(event);
  });
};

export const autoLoad = () => {
  const calendarElements = document.getElementsByClassName(addToCalendarClassName);

  Array.prototype.forEach.call(calendarElements, (element) => {
    createCalendar(element);
  });

  document.querySelectorAll('.atcb-item-link[data-event]').forEach(applyIcsIEHandler);
};

autoLoad();
