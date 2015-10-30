var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync').create();

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var scripts = [
	'js/Ghost.js',
	'js/Dragger.js',
	'js/StyleParser.js',
	'js/LayoutMode.js',
	// plugins
	'js/plugins/Title.js',
	'js/plugins/Guides.js',
	'js/plugins/Ghosts.js',
	'js/plugins/ContentEditable.js',
	'js/plugins/CompareAndPreview.js',
	// init
	'js/scripts/init.js'];

gulp.task('styles', function() {
	gulp.src('sass/**/*.scss')
		// initialize source maps for Sass
		.pipe(sourcemaps.init())
		// Run Sass to CSS compiler and log errors
		// to the console
		.pipe(sass().on('error', sass.logError))
		// Auto-prefix any CSS that requires it
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		// Write the finished source maps into the files
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/css'))
		.pipe(browserSync.stream());
});

// Scripts for source mode
gulp.task('scripts', function() {
	return gulp.src(scripts)
		// initialize source maps for JS
		.pipe(sourcemaps.init())
		//transpile from ES6 to ES5
		//.pipe(babel())
		// combine all files into one
		.pipe(concat('all.js'))
		// Write the finished source maps into the output file
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js'));
});

// Scripts for production
gulp.task('scripts-dist', function() {
	return gulp.src(scripts)
		//transpile from ES6 to ES5
		.pipe(babel())
		// combine all files into one
		.pipe(concat('all.js'))
		// minify the JS
		.pipe(uglify())
		.pipe(gulp.dest('build/js'));
});

gulp.task('copy-html', function() {
	gulp.src('./index.html')
		.pipe(gulp.dest('./build'));
});

gulp.task('lint', function () {
	return gulp.src(scripts)
		// eslint() attaches the lint output to the eslint property 
		// of the file object so it can be used by other modules. 
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console. 
		// Alternatively use eslint.formatEach() (see Docs). 
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on 
		// lint error, return the stream and pipe to failOnError last. 
		.pipe(eslint.failOnError());
});

//Watch task
gulp.task('default', ['copy-html', 'styles', 'lint', 'scripts'], function() {

	browserSync.init({
		server: './build'
	});

	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['lint', 'scripts']);
	gulp.watch('./index.html', ['copy-html']);
	gulp.watch('./build/index.html').on('change', browserSync.reload);
	gulp.watch('./build/js/all.js').on('change', browserSync.reload);

});

// Production task
gulp.task('dist', ['copy-html', 'styles', 'lint', 'scripts-dist']);