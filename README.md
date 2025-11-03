project-root/
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   ├── assets/
│   │   └── favicon.ico
├── components/
│   ├── header.html
│   ├── sidebar.html
│   └── footer.html
├── docs/
│   └── html/
│       └── introduction.html
├── playground/
│   └── try-editor.html
└── README.md



renderChildHeaderForDocs("../../../components/data/child-header.json"); //untuk load json jika sudah ditampilkan akan merujuk data di navbarjson
await renderSidebarFromJSONForDocs(jsonPathForDocs);//render
const jsonPathForDocs = `/docs/${section2}/navbar.json`; //untuk load location path json