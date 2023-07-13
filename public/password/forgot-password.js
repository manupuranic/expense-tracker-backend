const form = document.getElementById("forgotPasswordForm");
const msg = document.getElementById("message");

const messageHandler = (message, type) => {
  msg.innerText = message;
  msg.className = type;
  setTimeout(() => {
    msg.innerText = "";
    msg.className = "";
  }, 3000);
};

const submitHandler = async (e) => {
  e.preventDefault();
  const email = e.target.email;
  if (email.value === "") {
    messageHandler("Please Enter the mail id", "error");
  } else {
    let userDetails = {
      email: email.value,
    };
    try {
      const response = await axios.post(
        `http://localhost:3000/password/forgotpassword`,
        userDetails
      );
      const data = response.data;
      messageHandler(data.message, "success");
      localStorage.setItem("token", data.token);
      //   window.location.href = "../expenses/expenses.html";
      email.value = "";
    } catch (err) {
      console.log(err);
      messageHandler(err.response.data.message, "error");
    }
  }
};

form.addEventListener("submit", submitHandler);
