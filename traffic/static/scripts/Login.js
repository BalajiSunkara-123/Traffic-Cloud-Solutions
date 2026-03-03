// ===============================
// Google Login (Firebase)
// ===============================

const googleProvider = new firebase.auth.GoogleAuthProvider();

document.getElementById('google-login')?.addEventListener('click', () => {
    firebase.auth().signInWithPopup(googleProvider)
        .then((result) => {
            console.log(result.user);
            alert('Logged in as ' + result.user.displayName);
        })
        .catch((error) => {
            console.error(error);
        });
});


// ===============================
// Traffic Dept Secret Code Toggle
// ===============================

function checkPolice() {

    const checkbox = document.getElementById("question");
    const secretDiv = document.getElementById("secretCode");

    // SHOW INPUT
    if (checkbox.checked) {

        // prevent duplicate creation
        if (!document.getElementById("secretInput")) {

            let label = document.createElement("label");
            label.textContent = "Enter Your Code:";
            label.setAttribute("for", "secretInput");

            let ip = document.createElement("input");
            ip.type = "password";
            ip.id = "secretInput";
            ip.name = "secret_code";   // IMPORTANT for Django
            ip.placeholder = "Secret Code";

            secretDiv.appendChild(label);
            secretDiv.appendChild(document.createElement("br"));
            secretDiv.appendChild(ip);
        }

    } 
    // REMOVE INPUT WHEN UNCHECKED
    else {
        secretDiv.innerHTML = "";
    }
}