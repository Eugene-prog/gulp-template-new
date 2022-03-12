const { series, parallel, watch, src, dest } = require("gulp");
const pug = require("gulp-pug");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");
const rename = require("gulp-rename");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const svgSprite = require("gulp-svg-sprite");
const svgmin = require("gulp-svgmin");
const cheerio = require("gulp-cheerio");
const replace = require("gulp-replace");
const csso = require("gulp-csso");

const convertPugPages = () => {
  return src(["./src/pug/pages/**/*.pug", "!./src/pug/pages/**/components/**/*.pug"])
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(rename({ dirname: "" }))
    .pipe(dest("./dist"));
};

const removeFontsFolder = () => {
  return del("dist/fonts");
};

const copyFonts = () => {
  return src("./src/static/fonts/**/*.*").pipe(dest("dist/fonts"));
};

const copyImg = () => {
  return src(["./src/static/img/**/*.*", "!./src/static/img/icons/*.*"]).pipe(dest("dist/img"));
};

const convertComponentsStyles = () => {
  return src("src/pug/components/components.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest("dist/css"))
    .pipe(browserSync.stream());
};

const convertPagesStyles = () => {
  return src("src/pug/pages/pages.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest("dist/css"))
    .pipe(browserSync.stream());
};

const convertStaticStyles = () => {
  return src("src/static/scss/common.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(dest("dist/css"))
    .pipe(browserSync.stream());
};

const convertComponentsStylesMin = () => {
  return src("src/pug/components/components.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      csso({
        restructure: false,
        sourceMap: false,
        debug: true,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(rename("components.min.css"))
    .pipe(dest("dist/css"))
    .pipe(browserSync.stream());
};

const convertPagesStylesMin = () => {
  return src("src/pug/pages/pages.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      csso({
        restructure: false,
        sourceMap: false,
        debug: true,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(rename("pages.min.css"))
    .pipe(dest("dist/css"));
};

const convertStaticStylesMin = () => {
  return src("src/static/scss/common.scss")
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      csso({
        restructure: false,
        sourceMap: false,
        debug: true,
      })
    )
    .pipe(sourcemaps.write())
    .pipe(rename("common.min.css"))
    .pipe(dest("dist/css"));
};

const scripts = () => {
  return src("src/static/js/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(concat("scripts.js"))
    .pipe(sourcemaps.write())
    .pipe(dest("dist/js"))
    .pipe(browserSync.stream());
};

const scriptsMin = () => {
  return src("src/static/js/**/*.js").pipe(concat("scripts.min.js")).pipe(dest("dist/js"));
};

const libs = () => {
  return src([
    "./node_modules/object-fit-images/dist/ofi.min.js",
    "./node_modules/svg4everybody/dist/svg4everybody.min.js",
    "./node_modules/swiper/swiper-bundle.min.js",
  ])
    .pipe(concat("libs.min.js"))
    .pipe(uglify())
    .pipe(dest("dist/libs/"));
};

const clean = () => {
  return del("./dist");
};

const svg = () => {
  return (
    src("src/static/img/icons/**/*.svg")
      .pipe(
        svgmin({
          js2svg: {
            pretty: true,
          },
        })
      )
      .pipe(
        cheerio({
          run: function ($) {
            $("[fill]").removeAttr("fill");
            $("[stroke]").removeAttr("stroke");
            $("[style]").removeAttr("style");
          },
          parserOptions: { xmlMode: true },
        })
      )
      .pipe(replace("&gt;", ">"))
      // build svg sprite
      .pipe(
        svgSprite({
          mode: {
            symbol: {
              sprite: "sprite.svg",
            },
          },
        })
      )
      .pipe(dest("dist/img"))
  );
};

const serve = () => {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });
  watch(["src/pug/pages/**/*.pug", "src/pug/components/**/*.pug", "src/pug/templates/**/*.pug"]).on(
    "change",
    series(convertPugPages, browserSync.reload)
  );
  watch("src/pug/components/**/*.scss", convertComponentsStyles);
  watch("src/pug/pages/**/*.scss", convertPagesStyles);
  watch(["src/static/scss/**/*.scss", "src/pug/templates/**/*.scss"], convertStaticStyles);
  watch("src/static/js/**/*.js", scripts);
  watch("src/static/fonts/**/*.*", series(removeFontsFolder, copyFonts));
  watch(["!src/static/img/icons/**", "src/static/img/**/**"], copyImg);
  watch("src/static/img/icons/**/*.svg", svg);
};

exports.default = series(
  clean,
  convertPugPages,
  parallel(copyFonts, copyImg, svg, series(convertComponentsStyles, convertPagesStyles, convertStaticStyles)),
  parallel(libs, scripts),
  serve
);

exports.build = series(
  clean,
  convertPugPages,
  parallel(
    copyFonts,
    copyImg,
    svg,
    series(convertComponentsStyles, convertPagesStyles, convertStaticStyles),
    series(convertComponentsStylesMin, convertPagesStylesMin, convertStaticStylesMin)
  ),
  parallel(libs, scriptsMin, scripts)
);
