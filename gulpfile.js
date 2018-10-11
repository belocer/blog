const gulp = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cleanCSS = require("gulp-clean-css"),
    sourcemaps = require("gulp-sourcemaps"),
    gcmq = require("gulp-group-css-media-queries"),
    lessC = require("gulp-less"),
    imagemin = require("gulp-imagemin"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    watch = require("gulp-watch"),
    bs = require("browser-sync").create(),
    rev = require("gulp-rev-append"),
    babel = require("gulp-babel"),
    htmlmin = require("gulp-htmlmin"),
    sftp = require("gulp-sftp"),
    smartgrid = require("smart-grid");

const config = {
    src: "./src",
    dist: "./dist",
    css: {
        less: "/css/less/",
        wLess: "/css/less/**/*.less",
        css: "/css/"
    },
    html: {
        src: "/**/*.html"
    },
    js: {
        src: "/js/*.js"
    },
    php: {
        src: "/**/*.php"
    },
    img: {
        src: "/img/*",
        dist: "/img"
    }
};

// Сборщик
gulp.task("build", () => {
    gulp.src(config.src + "/css/less/main.less")         // !!! Меняем в зависимости от Препроцессора !!!
        .pipe(sourcemaps.init())
        .pipe(lessC())  // Компилятор LESS в CSS
        .pipe(gcmq())   // Объединяем одноширинные медиа запросы
        .pipe(autoprefixer({
            browsers: [">0.1%"], // Доступность браузеров в %
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(config.dist + config.css.css))
        .pipe(bs.reload({
            stream: true
        }));
});

// По умолчанию по команде gulp
gulp.task("default", ["bs", "build", "htmlo", "jso"], () => {
    gulp.watch(config.src + config.css.wLess, ["build"]);
    gulp.watch(config.src + "/css/less/*.less", ["build"]);
    gulp.watch(config.src + config.html.src, ["htmlo"]);
    gulp.watch(config.src + config.js.src, ["jso"]);
    gulp.watch(config.src + config.php.src, bs.reload);
});

// BrowserSync
gulp.task("bs", () => {
    bs.init({
        //proxy: "http://test/app/"                   // Для работы с php на OpenServer
        server: {
            baseDir: config.dist
        }
    });
});

// Оптимизация изображений
gulp.task("imgMin", () => {
    gulp.src(config.src + config.img.src)
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(config.dist + config.img.dist));
});

// Минификация HTML
gulp.task("htmlo", () => {
    return gulp.src(config.src + config.html.src)
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(config.dist))
        .pipe(bs.reload({
            stream: true
        }));
});

// Оптимизация JS файлов
gulp.task("jso", () => {
    return gulp.src(config.src + config.js.src)
        .pipe(babel({                               // Транспилятор es6 в es5
            presets: ["env"]
        }))
        .pipe(concat("main.js"))	                // Объединение js файлов
        .pipe(uglify())			                    // Минимизация js файла
        .pipe(rename({			                    // Переименование js файлов
            suffix: ".min"
        }))
        .pipe(gulp.dest(config.dist + "/js/"))
        .pipe(bs.reload({
            stream: true
        }));
});

/* Прописывает хэш, т.е. каждый раз после изменения будет новая версия,
 и у заказчика она будет скачиваться, а не браться из кэша браузера. Прописать после путей в link и script ?rev=@@hash */
gulp.task("rev", () => {
    gulp.src(config.dest + config.html.src)
        .pipe(rev())
        .pipe(gulp.dest(config.dist + "/"));
});

// Отправляем на хостинг
gulp.task("ftp", () => {
    return gulp.src(config.dist + "*")
        .pipe(sftp({
            host: "website.com",                    // url
            user: "johndoe",
            pass: "1234"
        }));
});


// Конфигурация для smart-grid или для сетки проекта
const smartGridConf = {
    //outputStyle: "less",
    columns: 12, // количество колонок
    offset: "15px", // Половина межколоночника
    mobileFirst: false,
    container: {
        maxWidth: "1200px", // максимальная ширина сайта
        fields: "30px" // Межколоночный отступ
    },
    breakPoints: {
        lg: {
            width: "1200px",
            fields: "30px"
        },
        md: {
            width: "992px",
            fields: "20px"
        },
        sm: {
            width: "768px",
            fields: "15px"
        },
        xs: {
            width: "576px",
            fields: "10px"
        },
        xxs: {
            width: "480px",
            fields: "5px"
        }
    }
};

// Создаём smart-grid.less
gulp.task("grid", () => {
    smartgrid(config.src + config.css.less, smartGridConf); // Путь до файла smart-grid.less и файл конфигурации
});