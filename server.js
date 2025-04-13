const http = require('http')
const path = require('path')
const fs = require('fs')


const pathToIndex = path.join(__dirname, 'static', 'index.html');
const indexHtmlFile = fs.readFileSync(pathToIndex);
const pathToStyle = path.join(__dirname, 'static', 'style.css');
const styleCssFile = fs.readFileSync(pathToStyle);
const pathToscript = path.join(__dirname, 'static', 'script.js');
const scriptFile = fs.readFileSync(pathToscript);

const server = http.createServer((req, res) => {

    if(req.url === '/'){
        return res.end(indexHtmlFile);
    }
    if(req.url === '/style.css'){
        return res.end(styleCssFile);
    }
    if(req.url === '/script.js'){
        return res.end(scriptFile);
    }

    res.statusCode = 404;
    return res.end('Error 404');
});

server.listen(3000);

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  console.log(socket.id);
    socket.on('new_message', (message) => {
        io.emit('message', message);
    })
});