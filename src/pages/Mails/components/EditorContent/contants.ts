//Vì nội dung từ QuillEditor sẽ có chưa các class định dạng của riêng quill-js
//=> khi cần render HTML với nội dung từ <QuillEditor/> cần gắn thêm header và footer để đưa css theo class của quill
const htmlHeader = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NSHM - Mail</title>
    <style>

    img {
      max-width: 100%;
    }

    .ql-align-center {
      text-align: center !important;
    }
    .ql-align-left {
      text-align: left !important;
    }
    .ql-align-right {
      text-align: right !important;
    }
    .ql-align-justify {
      text-align: justify !important;
    }

    .ql-indent-1 {
        padding-left: 3em;
    }
    .ql-indent-2 {
        padding-left: 6em;
    }
    .ql-indent-3 {
        padding-left: 9em;
    }
    .ql-indent-4 {
        padding-left: 12em;
    }
    .ql-indent-5 {
        padding-left: 15em;
    }
    .ql-indent-6 {
        padding-left: 18em;
    }
    .ql-indent-7 {
        padding-left: 21em;
    }
    .ql-indent-8 {
        padding-left: 24em;
    }

    </style>
  </head>

  <body>
    <div style="line-height: 1.5rem; padding: 5px; background-color: whitesmoke">
      <div
        style="
          max-width: 800px;
          border: 1px solid rgb(33, 89, 103);
          padding: 10px 20px 10px 30px;
          background-color: white;
          margin: auto;
        "
      >
        <br />`;
const htmlFooter = `</div></div></body></html>`;


export {htmlHeader,htmlFooter}