const registrform = document.getElementById("registr-form");
const loginform = document.getElementById("login-form");

registrform?.addEventListener('submit', (event) =>{
    event.preventDefault();
    const {login, password, passwordAgain} = registrform;
    if(password.value !== passwordAgain.value){
        return alert("Паролі не співпадають")
    }

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/register');
    xhr.send(user);
    xhr.onload = () => alert(xhr.response);
})

loginform?.addEventListener('submit', (event) =>{
    event.preventDefault();
    console.log
    const {login, password} = loginform;

    const user = JSON.stringify({
        login: login.value,
        password: password.value
    });
    console.log(user)
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login');
    xhr.send(user);
    xhr.onload = () => {
        if(xhr.status === 200) {
            const token = xhr.response;
            document.cookie = `token=${token}`;
            window.location.assign('/');
        }
        else {
            return alert(xhr.response);
        }
    }
})