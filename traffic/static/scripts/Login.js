const googleProvider = new firebase.auth.GoogleAuthProvider();
document.getElementById('google-login').addEventListener('click', () => {
    firebase.auth().signInWithPopup(googleProvider)
        .then((result) => {
            console.log(result.user);
            alert('Logged in as ' + result.user.displayName);
        })
        .catch((error) => {
            console.error(error);
        });
});

function checkPolice(){
    // console.log("hi")
    let secretDiv=document.getElementById("secretCode");
    let label=document.createElement("label");
    label.textContent="Enter Your Code";
    let ip=document.createElement("input");
    ip.type="password";
    secretDiv.appendChild(label);
    secretDiv.appendChild(ip);
}