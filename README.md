https://github.com/AddToCalendar/addtocalendar is now part of https://www.addevent.com/ and in future will be suspended at all.
So, this is almost complete rewrite of that library.


### Setup

#### Auto applying

1. add JS to the page
2. add `addtocalendar` class to element in which you want to add calendar button
3. add event parameters as a child of `.addtocalendar`

####

### Options

#### Default
* `language` is assumed as browser locale, but if it's not among predefined languages defaultLanguage will be used, i.e. `en`
* `calendars` calendars to show. Is and array. Possible values are: `iCalendar, googleCalendar, outlook, yahoo`
* `translations` key/value object containing translations. If some translation is missing default (`en`) will be used

##### Translations
Default keys are:

* `buttonText`
* `iCalendar`
* `googleCalendar`
* `outlook`
* `yahoo`

##### Override Options
1. via global vatiables `atcOverrides`
2. via `data-atc-*` attributes   

#### Notes
Options are applied in the following way:
`settings = Object.assign(default, global variable, data-atc-*)`

### Event Parameters

* `date_start` in case it's passed via `html` element it should be in ISO 8601 format; otherwise it's passed as regular `Date`
* `date_end` in case it's passed via `html` element it should be in ISO 8601 format; otherwise it's passed as regular `Date`
* `title`
* `description`
* `location`

### Examples

#### Auto
in this case plugin will automatically find `.addtocalendar` elements then will parse event and show it:
1. Add JS 
```html
<script src="add-to-calendar.min.js" async></script>
```
or if you're using ES6:
```javascript
import 'add-to-calendar';
```

2. Add styles
```html
<link href="add-to-calendar.css" rel="stylesheet" type="text/css">
<link href="themes/blue.css" rel="stylesheet" type="text/css">
```

3. Place html
```html
<span class="addtocalendar atc-style-blue">
  <var class="atc_event">
    <var class="atc_date_start">2018-09-05T12:00:00.000Z</var>
    <var class="atc_date_end">2018-09-05T18:00:00.000Z</var>
    <var class="atc_timezone">Europe/London</var>
    <var class="atc_title">Star Wars Day Party</var>
    <var class="atc_description">May the force be with you</var>
    <var class="atc_location">Tatooine</var>
    <var class="atc_organizer">Luke Skywalker</var>
    <var class="atc_organizer_email">luke@starwars.com</var>
  </var>
</span>
```

### Manually (ES6)

1. Install dependency
```
npm i @nicolai8/add-to-calendar
```
  
2. Import method
```javascript
import { createCalendar } from 'add-to-calendar';
```

3. Call it with `element`, `settings` and `eventParams`
```javascript
const element = document.getElementById('addToCalendarButton');
const settings = {
  language: 'jp',
};
const event = {
  title: 'Event title',
  date_start: new Date(),
  date_end: new Date(),
};
createCalendar(element, settings, event);
```

### Browser Support
```
* IE11+ (.ics is working via Blob)
* last 2 versions of major browsers
```

### Notes

Built on top of _https://github.com/google/web-starter-kit_ with some updates to latest versions
And also inspired by _https://github.com/carlsednaoui/add-to-calendar-buttons_
