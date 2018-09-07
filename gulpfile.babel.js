import gulp from 'gulp';
import uglify from 'gulp-uglify-es';
import browserify from 'browserify';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import eventStream from 'event-stream';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Lint JavaScript
gulp.task('lint', () =>
  gulp.src(['src/**/*.js', '!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
);

gulp.task('copy:dist', () =>
  gulp.src([
    'src/**/*',
    '!src/**/*.js',
    '!src/**/*.html',
    '!src/**/*.scss',
    '!src/**/*.css',
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({ title: 'copy' }))
);

gulp.task('copy', () =>
  gulp.src([
    'src/*',
    '!src/*.html',
    '!src/*.js',
    '!src/*.css',
  ], {
    dot: true
  }).pipe(gulp.dest('.tmp'))
    .pipe($.size({ title: 'copy' }))
);

const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('styles:dist', () => {
  return gulp.src([
    'src/**/*.scss',
    'src/**/*.css'
  ])
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe($.size({ title: 'styles' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('styles', () => {
  return gulp.src([
    'src/**/*.scss',
    'src/**/*.css'
  ])
    .pipe($.newer('.tmp'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('scripts:dist', () => {
  const common = browserify({
    entries: './src/add-to-calendar.js',
    standalone: 'add-to-calendar'
  })
    .transform('babelify')
    .bundle()
    .pipe(source('add-to-calendar.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'));

  const browserified = browserify({
    entries: './src/add-to-calendar.js',
    standalone: 'add-to-calendar'
  })
    .transform('babelify')
    .bundle()
    .pipe(source('add-to-calendar.js'))
    .pipe(buffer())
    .pipe(uglify({
      ie8: true,
      output: {
        comments: /@license|@preserve|@cc_on|\bMIT\b|\bMPL\b|\bGPL\b|\bBSD\b|\bISCL\b|\(c\)|License|Copyright/mi
      }
    }))
    .on('error', console.error)
    .pipe($.concat('add-to-calendar.min.js'))
    .pipe($.size({ title: 'scripts' }))
    .pipe(gulp.dest('dist'));

  return eventStream.concat(common, browserified);
});

gulp.task('scripts', () => {
    const bundler = browserify({
      entries: './src/add-to-calendar.js',
      debug: true
    }).transform('babelify');

    return bundler.bundle()
      .pipe(source('add-to-calendar.js'))
      .pipe(buffer())
      .pipe(gulp.dest('.tmp'));
  }
);

gulp.task('html:dist', () => {
  return gulp.src('src/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,src}',
      noAssets: true
    }))
    .pipe($.if('*.html', $.size({ title: 'html', showFiles: true })))
    .pipe(gulp.dest('dist'));
});

gulp.task('html', () => {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('.tmp'));
});

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], { dot: true }));

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'html', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'src'],
    port: 4567
  });

  gulp.watch(['src/**/*.html'], ['html', reload]);
  gulp.watch(['src/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['src/**/*.js'], ['lint', 'scripts', reload]);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 5678
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence(
    'styles:dist',
    ['lint', 'html:dist', 'scripts:dist', 'copy:dist'],
    cb
  )
);
