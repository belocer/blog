const smartgrid = require("smart-grid");

const settings = {
    //filename: "_smartgrid",     // для переименвания файла
    outputStyle: "less",        // тип файла на выходе
    columns: 12,                // количество колонок в проекте
    offset: "30px",             // общий отступ между колонками
    container: {
        // Ширина сайта без карты
        maxWidth: "1200px",
        fields: "30px"          // Отступ контента от краёв wrapper
    },
    breakPoints: {              // переопределяем под свой проект
        md: {
            width: "992px",
            fields: "20px"
        },
        sm: {
            width: "720px",
            fields: "10px"
        },
        xs: {
            width: "576px",
            fields: "5px"
        },
        xxs: {
            width: "380px",
            fields: "5px"
        }
    },
    oldSizeStyle: false,        // для старых версий smart-grid
    properties: [
        "justify-content"
    ]
};

// Указываем папку куда нужно сгенерировать Smart-Grid
smartgrid("./src/less", settings);