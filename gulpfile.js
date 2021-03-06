const browserSync = require('browser-sync').create()
const del = require('del')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const postcss = require('gulp-postcss')
const rucksack = require('rucksack-css')
const lost = require('lost')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const rename = require('gulp-rename')
const notify = require('gulp-notify')
const sass = require('gulp-sass')
const webpack = require('webpack-stream')

const path = './src'

function clean() {
  return del('dist')
}

const scss = (isProduction) => {
  var postCssPlugin = [
    rucksack(),
    lost(),
    autoprefixer({browsers: ['> 1%', 'last 3 versions', 'Firefox >= 20', 'iOS >=7']}),
  ]

  if (isProduction) postCssPlugin.push(cssnano())

  return () => gulp.src(path + '/scss/main.scss')
  .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
  .pipe(sass().on('error', sass.logError))
  .pipe(postcss(postCssPlugin))
  .pipe(rename('style.css'))
  .pipe(gulp.dest(path + '/assets/'))
  .pipe(browserSync.stream())
}

const js = (isProduction) => {
  return () => gulp.src(path + '/js/index.js')
  .pipe(webpack({
    mode: isProduction ? 'production' : 'development'
  }))
  .pipe(rename('script.js'))
  .pipe(gulp.dest(path + '/assets/'))
  .pipe(browserSync.stream())
}

const htmls = () => {
  return gulp.src(path + "/*.html")
  .pipe(gulp.dest("dist/"))
}

const assets = () => {
  return gulp.src(path + "/assets/**/*")
  .pipe(gulp.dest("dist/assets"))
}

const watch = () => {
  browserSync.init({
    server: path,
    notify: false,
    port: 8080
  })

  gulp.watch(path + '/scss/**', scss())
  gulp.watch(path + '/js/*.js', js())
  gulp.watch(path + '/*.html').on('change', browserSync.reload)
}

exports.build = gulp.series(clean, gulp.parallel(scss(true), js(true), htmls), assets)
exports.default = gulp.series(gulp.parallel(scss(), js()), watch)
