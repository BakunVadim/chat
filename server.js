const http = require('http')
const path = require('path')
const fs = require('fs')
const db = require('./database')
const cookie = require('cookie')

const validAuthTokens = [];

const pathToIndex = path.join(__dirname, 'static', 'index.html');
const indexHtmlFile = fs.readFileSync(pathToIndex);
const pathToStyle = path.join(__dirname, 'static', 'style.css');
const styleCssFile = fs.readFileSync(pathToStyle);
const pathToscript = path.join(__dirname, 'static', 'script.js');
const scriptFile = fs.readFileSync(pathToscript);
const pathToAuthScript = path.join(__dirname, 'static', 'auth.js');
const authScriptFile = fs.readFileSync(pathToAuthScript);
const pathToRegister = path.join(__dirname, 'static', 'register.html');
const registerHtmlFile = fs.readFileSync(pathToRegister);
const pathToLogin = path.join(__dirname, 'static', 'login.html');
const loginHtmlFile = fs.readFileSync(pathToLogin);

const server = http.createServer((req, res) => {

    if (req.method === 'GET') {
        if (req.url === '/style.css') {
            return res.end(styleCssFile);
        }
        else if (req.url === '/script.js') {
            return res.end(scriptFile);
        }
        else if (req.url === '/auth.js') {
            return res.end(authScriptFile);
        }
        else if (req.url === '/register.html') {
            return res.end(registerHtmlFile);
        }
        else if (req.url === '/login.html') {
            return res.end(loginHtmlFile);
        } else return guarded(req, res);
    }


    if (req.method === 'POST') {
        if (req.url === '/api/register') {
            return registerUser(req, res);
        }
        if (req.url === '/api/login') {
            return login(req, res);
        } else return guarded(req, res);
    }

    // res.statusCode = 404;
    // return res.end('Error 404');
});

function registerUser(req, res) {
    let data = '';
    req.on('data', function (chank) {
        data += chank;
    });
    req.on('end', async function () {
        try {
            const user = JSON.parse(data);
            if (!user.login || !user.password) {
                return res.end("Пропущено логін чи пароль")
            }
            if (await db.isUserExist(user.login)) {
                return res.end("Такий користувач вже існує");
            }
            await db.addUser(user)
            return res.end("Користувача додано");

        } catch (error) {

        }
    })
}

function login(req, res) {
    let data = '';
    req.on('data', function (chank) {
        data += chank;
    });
    req.on('end', async function () {
        try {
            const user = JSON.parse(data);
            const token = await db.getAuthToken(user);
            validAuthTokens.push(token);
            res.writeHead(200);
            res.end(token);
        } catch (e) {
            res.writeHead(500);
            return res.end('Error: ' + e);
        }
    });
}

function guarded(req, res) {
    const credentionals = getCredentionals(req);
    if(!credentionals) {
      res.writeHead(401, {'Location': '/register'})
    }
    if(req.method === 'GET') {
      switch(req.url) {
        case '/': return res.end(indexHtmlFile);
        case '/script.js': return res.end(scriptFile);
      }
    }
    res.writeHead(404);
    return res.end('Error 404');
  }

  
function getCredentionals(req) {
    const cookies = cookie.parse(req.headers?.cookie || '')
    const token = cookies?.token;
    if (!token || !validAuthTokens.includes(token)) return null;
    const [user_id, login] = token.split('.');
    if (!user_id || !login) return null;
    return { user_id, login }
}

server.listen(3000);

const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', async (socket) => {
    console.log(socket.id);
    let messages = await db.getMessages();
    let userName = 'admin';
    socket.emit('all_messages', messages);
    socket.on('new_message', (message) => {
        db.addMessage(message, 1)
        io.emit('message', userName + ': ' + message);
    })
});