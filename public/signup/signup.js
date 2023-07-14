const baseUrl = "http://localhost:3000";

const signUpForm = document.getElementById("signUpForm");
const msg = document.getElementById("message");

const messageHandler = (message, type) => {
  msg.innerText = message;
  msg.className = type;
  setTimeout(() => {
    msg.innerText = "";
    msg.className = "";
  }, 5000);
};

const signUpHandler = async (event) => {
  event.preventDefault();
  console.log(event.target);
  const userName = event.target.userName;
  const email = event.target.email;
  const password = event.target.password;
  if (userName.value === "" || email.value === "" || password.value === "") {
    messageHandler("Please Enter all the fields", "error");
  } else {
    let userDetails = {
      userName: userName.value,
      email: email.value,
      password: password.value,
    };
    try {
      const response = await axios.post(`${baseUrl}/user/sign-up`, userDetails);
      const user = response.data;
      if (user.message) {
        messageHandler(response.data.message, "error");
      } else {
        console.log(user);
        messageHandler("Signup successfull", "success");
        window.location.href = "../login/login.html";
        userName.value = "";
        email.value = "";
        password.value = "";
      }
    } catch (err) {
      messageHandler(`Something Went wrong: ${err.message}`, "error");
    }
  }
};

signUpForm.addEventListener("submit", signUpHandler);
