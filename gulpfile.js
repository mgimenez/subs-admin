/**
 * Dependencys
 */
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    copy = require('gulp-contrib-copy'),
    connect = require('gulp-connect'),
    jshint = require('gulp-jshint');
    stylish = require('jshint-stylish'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    htmlreplace = require('gulp-html-replace'),
    runSequence = require('run-sequence'),
    color = require('gulp-color'),
    imagemin = require('gulp-imagemin'),
    source = require('vinyl-source-stream'), // Used to stream bundle for further handling
    browserify = require('browserify'),
    watchify = require('watchify'),
    babelify = require('babelify'),
    reactify = require('reactify'),
    path = {
      src: './src',
      dist: './dist',
      scss: './src/scss',
      js: './src/js'
    };

/**
 * Tasks
 */

// Generates and merges CSS files from SASS
gulp.task('sass', function () {
    return gulp.src(path.scss + '/styles.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.dist + '/css'))
    .pipe(connect.reload());
});

// Copy HTML Files
gulp.task('copyHtml', function() {
  gulp.src(path.src + '/**/*.html')
    .pipe(copy())
    .pipe(gulp.dest(path.dist));
});

// Copy JS Files
gulp.task('copyJs', function() {
  gulp.src(path.js + '/**/*.js')
    .pipe(copy())
    .pipe(gulp.dest(path.dist + '/js'));
});

// Copy JSX Files
gulp.task('copyJsx', function() {
  gulp.src(path.js + '/**/*.jsx')
    .pipe(copy())
    .pipe(gulp.dest(path.dist + '/js'));
});

// Copy vendor Files
gulp.task('copyVendor', function() {
  gulp.src(path.src + '/vendor/**/*.*')
    .pipe(copy())
    .pipe(gulp.dest(path.dist + '/vendor'));
});

// Copy fonts Files
gulp.task('copyFonts', function() {
  gulp.src(path.src + '/fonts/**/*.*')
    .pipe(copy())
    .pipe(gulp.dest(path.dist + '/fonts'));
});

gulp.task('imagemin', function() {
    gulp.src(path.src + '/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest(path.dist + '/images'))
});

// Watches for SCSS, HTML, JS Files
gulp.task('watch', function () {
    gulp.watch(path.scss + '/**/*.scss', ['sass']);
    gulp.watch(path.src + '/**/*.html', ['copyHtml']);
    gulp.watch(path.src + '/**/*.js', ['hintJs', 'copyJs']);
    gulp.watch(path.src + '/**/*.jsx', ['copyJsx']);
});


// JS HINT
gulp.task('hintJs', function() {
  return gulp.src(path.js + '/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// Browserify & convert to ES5
gulp.task('browserify', function () {
    return browserify({
        entries: path.js + '/video.jsx',
        extensions: ['.jsx'],
        debug: true
      })
      .transform(reactify)
      .bundle()
      .pipe(source('app.js'))
      .pipe(gulp.dest(path.dist + '/js'));
});

/* Browserify
gulp.task('browserify', function() {

    var bundler = browserify({
        entries: [path.js + '/video.jsx'], // Only need initial file, browserify finds the deps
        transform: [reactify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });

    var watcher  = watchify(bundler);

    return watcher
    .on('update', function () { // When any files update
        var updateStart = Date.now();
        console.log('Updating!');
        watcher.bundle() // Create new bundle that uses the cache for high performance
        .pipe(source('video.jsx'))
        // This is where you add uglifying etc.
        .pipe(gulp.dest(path.dist + '/js'));
        console.log('Updated!', (Date.now() - updateStart) + 'ms');
    })
    .bundle() // Create the initial bundle when starting the task
    .pipe(source('video.js'))
    .pipe(gulp.dest(path.dist + '/js'));
});
*/

// Concat JS
gulp.task('concatJs', function (cb) {
  pump([
        gulp.src(path.js + '/*.js'),
        concat('app.js'),
        gulp.dest(path.dist + '/js')
    ],
    cb);
});

// Uglify JS
gulp.task('uglifyJs', function (cb) {
  pump([
        gulp.src(path.dist + '/js/*.js'),
        uglify({
          mangle: false
        }),
        gulp.dest(path.dist + '/js')
    ],
    cb);
});

// Merge Script tags
gulp.task('mergeScript', function () {
    gulp.src(path.dist + '/**/*.html')
        .pipe(htmlreplace({
            'js': 'js/app.js'
        }))
        .pipe(gulp.dest(path.dist));
});

// Remove files
gulp.task('clean', function () {
  return gulp.src(path.dist + '/*', {read: false})
    .pipe(clean());
});

// Server
gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});


gulp.task('deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});



gulp.task('dist', function() {
  runSequence('clean', 'sass', 'hintJs', 'copyJs', 'copyVendor', 'imagemin', function() {
    console.log(color('SUCCESSFULLY DIST!', 'YELLOW'));
  });
});

gulp.task('dev', function(callback) {
  runSequence('clean', 'sass', 'hintJs', 'copyJsx', 'copyVendor', 'copyFonts', 'imagemin', 'copyHtml', 'watch', 'connect', function() {
    console.log(color('HAPPY DEV!', 'BLUE'));
  });
});

gulp.task('build', function(callback) {
  runSequence('clean', 'sass', 'hintJs', 'concatJs', 'uglifyJs', 'copyVendor', 'imagemin', 'mergeScript', function() {
    console.log(color('SUCCESSFULLY BUILD!', 'YELLOW'));
  });
});