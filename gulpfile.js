
var env               = process.env.NODE_ENV || 'development';

var fs                = require('fs');
var gulp              = require("gulp");
var plugins           = require('gulp-load-plugins')({camelize: true});

// ES6
var vinylSourceStream = require('vinyl-source-stream');
var vinylBuffer       = require('vinyl-buffer');
var browserify        = require('browserify');
var babelify          = require('babelify');

/**
 * 
 * Files
 * 
 */

var files = {};

files.vendorFonts = [
                      'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot',
                      'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg',
                      'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf',
                      'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff',
                      'bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff2'
                    ];

files.vendorCss = [
                    'bower_components/bootstrap/dist/css/bootstrap.min.css',
                    'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
                    'bower_components/bootstrap-additions/dist/bootstrap-additions.min.css',
                    'bower_components/angular-motion/dist/angular-motion.min.css',
                  ];

files.vendorJs = [    
                    'bower_components/lodash/dist/lodash.min.js',
                    'bower_components/angular/angular.min.js',
                    'bower_components/angular-route/angular-route.min.js',
                    'bower_components/angular-animate/angular-animate.min.js',
                    'bower_components/angular-strap/dist/angular-strap.min.js',
                    'bower_components/angular-strap/dist/angular-strap.tpl.min.js',
                    'bower_components/restangular/dist/restangular.min.js',
                    'bower_components/angular-smart-table/dist/smart-table.min.js',
                    'bower_components/ngstorage/ngStorage.min.js'
                  ];

files.appJs = ['scripts/**/*module.js', 'scripts/**/*.js','scripts/*.js'];

files.appCss = [ 
                'styles/typography.css',
                'styles/global_styles.css',
                'styles/layout.css',
                'styles/navegation.css',
                'styles/app/widgets/common/my_tests.css'
               ];

files.appJson = 'scripts/**/*.json';

files.appHtml = 'scripts/**/*.html';

files.appSass = 'styles/**/*.scss';

/**
 * 
 * Development
 * 
 */

gulp.task("html", function() {
  var stream = gulp.src('dist/*.html')
  .pipe(plugins.connect.reload()); 
  return stream;
});


gulp.task('vendor-copy-fonts', function() {
    
  var stream = gulp.src( files.vendorFonts )
   .pipe(gulp.dest('dist/fonts/'))
  return stream;
  
});

gulp.task("vendor-concat-css", function() {
  
  var stream = gulp.src(files.vendorCss)
    .pipe(plugins.concat('vendor.min.css'))  
    .pipe(gulp.dest('dist/css/'))
    .pipe(plugins.connect.reload());    
  
  return stream;
  
});

gulp.task("vendor-concat-js", function() {
  
  var stream = gulp.src(files.vendorJs)
    .pipe(plugins.concat('vendor.min.js'))  
    .pipe(gulp.dest('dist/js/'))
    .pipe(plugins.connect.reload());    
  
  return stream;
  
});

gulp.task('app-transpile-js', ['minify-templates','copy-json'], function (){
  
  var bundler = browserify({
    entries: 'scripts/app.js',
    debug: true
  })
  .transform(babelify, { presets: ["es2015"] });  
  
  return bundler.bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(vinylSourceStream('app.min.js'))
    .pipe(vinylBuffer())
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.ngAnnotate())  
    .pipe(plugins.uglify())
    .pipe(plugins.header(getCopyrightVersion(), {version: getVersion()}))  
    .pipe(plugins.sourcemaps.write('./'))  
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.connect.reload());
  
});

gulp.task('app-minify-js', ['minify-templates','copy-json'], function (){
  var stream = gulp.src(files.appJs)
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify())
    .pipe(plugins.concat('app.min.js'))
    .pipe(plugins.header(getCopyrightVersion(), {version: getVersion()}))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(plugins.connect.reload());    
  return stream;
});

gulp.task('minify-templates', function () {
  var stream = gulp.src(files.appHtml)
    .pipe(plugins.htmlmin({collapseWhitespace: true, empty: true, removeComments: true}))
    .pipe(gulp.dest('dist/js/'))    
  return stream;  
});

gulp.task('copy-json', function() {
  var stream = gulp.src(files.appJson)
   .pipe(gulp.dest('dist/js/'))
  return stream;
});

gulp.task('compile-sass', function () {
  var stream = gulp.src(files.appSass)
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.sass().on('error', plugins.sass.logError))
    .pipe(plugins.autoprefixer()) 
    .pipe(plugins.cleanCss())    
    .pipe(plugins.header(getCopyrightVersion(), {version: getVersion()}))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(plugins.connect.reload());
  return stream;  
});

gulp.task('minify-css', function () {
  
  
  var stream = gulp.src( files.appCss )
    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
    .pipe(plugins.concat('styles.min.css'))
    .pipe(plugins.autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		})) 
    .pipe(plugins.cleanCss())    
    .pipe(plugins.header(getCopyrightVersion(), {version: getVersion()}))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/css/'))
    .pipe(plugins.connect.reload());
  return stream;  
});

gulp.task('watch', function() { 
    //gulp.watch('styles/**/*.scss', ['compile-sass']);
    gulp.watch('styles/**/*.css', ['minify-css']);
    gulp.watch('scripts/**/*.js', ['app-transpile-js']);
    //gulp.watch('resources/images/**/*.{jpg,png,gif}');
    gulp.watch('scripts/**/*.html', ['minify-templates']);
    gulp.watch('scripts/**/*.json', ['copy-json']);
    gulp.watch('dist/*.html', ['html']); 
});

gulp.task('connect', function() { 
  plugins.connect.server({
    root: './dist/', 
    port: 8000, 
    livereload: true 
  });
});

gulp.task('default', ['vendor-copy-fonts', 'vendor-concat-css', 'vendor-concat-js', 'app-transpile-js', 'minify-css', 'watch', 'connect'], function() {
  //Now open in browser 
  var stream = gulp.src("") 
  .pipe(plugins.open({ 
    app: "google chrome", 
    uri: "http://localhost:8000"
  })); 
  return stream; 
});


/**
 * 
 * QA related tasks
 * 
 */

gulp.task('jshint', function () {
    gulp.src('scripts/**/*.js')
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter());
});


/**
 * 
 * Auxiliary functions
 * 
 */

function getVersion() {
    return fs.readFileSync('Version');
};
 
function getCopyrightVersion() {
    return fs.readFileSync('Copyright');
};
