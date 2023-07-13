const baseUrl = "http://44.204.76.209:3000";

const msg = document.getElementById("message");
const form = document.getElementById("addExpense");
const expenseList = document.getElementById("expenses");
const premiumBtn = document.getElementById("premium-btn");
const premiumInfo = document.getElementById("premium-info");
const logout = document.getElementById("logout");
const leaderboardList = document.getElementById("leaderboard-list");
const showLeaderboardBtn = document.getElementById("showLeaderboard");
const leaderboardDiv = document.querySelector(".leaderboard");
const downloadBtn = document.getElementById("download-btn");
const downloadDiv = document.querySelector(".download");
const fileDownloadBody = document.getElementById("file-download-body");
const fileDownloadDiv = document.getElementById("fileDownloads");
const paginationDiv = document.getElementById("pagination");
const selectPerPage = document.getElementById("perPage");

const token = localStorage.getItem("token");
const perPage = localStorage.getItem("perPage");

if (!token) {
  window.location.href = "../login/login.html";
}

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("perPage");
  window.location.href = "../login/login.html";
});

document.getElementById("premium-btn").addEventListener("click", async (e) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${baseUrl}/purchase/premiummembership`, {
    headers: {
      Authentication: token,
    },
  });
  var options = {
    key: response.data.key_id,
    order_id: response.data.order.id,
    handler: async function (response) {
      const result = await axios.post(
        `${baseUrl}/purchase/updatetransactionstatus`,
        {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
          success: true,
        },
        { headers: { Authentication: token } }
      );
      const newToken = result.data.token;
      localStorage.setItem("token", newToken);
      getExpenses(1);
      alert("You are now a Premium User!");
    },
  };

  const rzpy = new Razorpay(options);
  rzpy.open();
  e.preventDefault();

  rzpy.on("payment.failed", async function (response) {
    console.log(response);

    await axios.post(
      `${baseUrl}/purchase/updatetransactionstatus`,
      {
        order_id: options.order_id,
        sucess: false,
      },
      { headers: { Authentication: token } }
    );
    alert("something went wrong!!");
  });
});

const messageHandler = (message, type) => {
  msg.innerText = message;
  msg.className = type;
  setTimeout(() => {
    msg.innerText = "";
    msg.className = "";
  }, 5000);
};

const displayLeaderboard = (user) => {
  const li = document.createElement("li");
  const spanIndex = document.createElement("span");
  const spanUserName = document.createElement("span");
  const spanTotalExpense = document.createElement("span");
  const symbol = document.createElement("span");
  const amountDiv = document.createElement("div");

  li.className = "list-group-item leaderboard-li";
  spanUserName.className = "span-UserName";
  spanTotalExpense.className = "span-TotalExpense";
  symbol.className = "symbol";
  amountDiv.className = "amount-div";
  spanIndex.className = "serial-index";

  spanUserName.appendChild(document.createTextNode(user.userName));
  if (user.totalExpense) {
    spanTotalExpense.appendChild(document.createTextNode(user.totalExpense));
  } else {
    spanTotalExpense.appendChild(document.createTextNode(0));
  }
  spanIndex.appendChild(document.createTextNode(user.index));
  symbol.appendChild(document.createTextNode("₹"));

  li.appendChild(spanIndex);
  li.appendChild(spanUserName);
  amountDiv.appendChild(symbol);
  amountDiv.appendChild(spanTotalExpense);
  li.appendChild(amountDiv);

  leaderboardList.appendChild(li);
};

const getLeaderboard = async (e) => {
  leaderboardList.replaceChildren();
  try {
    const response = await axios.get(`${baseUrl}/premium/showLeaderboards`);
    leaderboardDiv.style.display = "block";
    const leaderboard = response.data;
    leaderboard.forEach((user, index) => {
      displayLeaderboard({ ...user, index: index + 1 });
    });
    window.location.href = "#leaderboard-list";
  } catch (err) {
    console.log(err);
  }
};
showLeaderboardBtn.addEventListener("click", getLeaderboard);

const displayExpenses = (exp) => {
  const li = document.createElement("li");
  const delBtn = document.createElement("button");

  const spanAmount = document.createElement("span");
  const spanDesc = document.createElement("span");
  const spanCategory = document.createElement("span");
  const symbol = document.createElement("span");

  li.className = "list-group-item";
  li.id = exp.id;
  delBtn.className = "btn btn-danger li-btn delete";
  spanAmount.className = "span-amount";
  spanCategory.className = "span-category";
  spanDesc.className = "span-desc";
  symbol.className = "symbol";

  spanAmount.appendChild(document.createTextNode(exp.amount));
  spanDesc.appendChild(document.createTextNode(exp.desc));
  spanCategory.appendChild(document.createTextNode(exp.category));
  symbol.appendChild(document.createTextNode("₹"));

  delBtn.appendChild(document.createTextNode("Delete"));

  delBtn.addEventListener("click", deleteHandler);

  li.appendChild(symbol);
  li.appendChild(spanAmount);
  li.appendChild(spanDesc);
  li.appendChild(spanCategory);
  li.appendChild(delBtn);

  expenseList.appendChild(li);
};

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const premiumFeatures = async () => {
  const token = localStorage.getItem("token");
  const decoded = parseJwt(token);
  if (decoded.isPremium) {
    premiumBtn.style.display = "none";
    premiumInfo.style.display = "inline";
    showLeaderboardBtn.style.display = "inline";
    downloadDiv.style.display = "block";
    downloadBtn.classList.remove("disabled");
  }
};

const showPagination = (pageData) => {
  paginationDiv.replaceChildren();
  const {
    currentPage,
    isNextPage,
    isPreviousPage,
    previousPage,
    nextPage,
    lastPage,
  } = pageData;

  const prevBtn = document.createElement("button");
  prevBtn.appendChild(document.createTextNode("Prev"));
  if (isPreviousPage) {
    prevBtn.className = "btn btn-sm";
  } else {
    prevBtn.className = "btn btn-sm disabled";
  }
  prevBtn.addEventListener("click", () => getExpenses(previousPage));
  paginationDiv.appendChild(prevBtn);

  const currentPageSpan = document.createElement("span");
  currentPageSpan.appendChild(
    document.createTextNode(`${currentPage}/${lastPage}`)
  );
  paginationDiv.appendChild(currentPageSpan);

  const nextBtn = document.createElement("button");
  nextBtn.appendChild(document.createTextNode("Next"));
  if (isNextPage) {
    nextBtn.className = "btn btn-sm";
  } else {
    nextBtn.className = "btn btn-sm disabled";
  }
  nextBtn.addEventListener("click", () => getExpenses(nextPage));
  paginationDiv.appendChild(nextBtn);
};

const getExpenses = async (page) => {
  expenseList.replaceChildren();
  premiumFeatures();
  const token = localStorage.getItem("token");
  const perPage = localStorage.getItem("perPage");
  try {
    const res = await axios.get(
      `${baseUrl}/expenses/${page}?perPage=${perPage}`,
      {
        headers: { Authentication: token },
      }
    );
    const {
      expenses,
      currentPage,
      isNextPage,
      isPreviousPage,
      previousPage,
      nextPage,
      lastPage,
    } = res.data;
    if (expenses.length === 0) {
      selectPerPage.style.visibility = "hidden";
      expenseList.innerHTML += `<li class='list-group-item'><p style='text-align: center'>No expenses found! Add expenses above.</p></li>`;
      paginationDiv.style.visibility = "hidden";
    } else {
      expenses.forEach((exp) => {
        displayExpenses(exp);
      });
      paginationDiv.style.visibility = "visible";
      showPagination({
        currentPage,
        isNextPage,
        isPreviousPage,
        previousPage,
        nextPage,
        lastPage,
      });
      selectPerPage.style.visibility = "visible";
    }
  } catch (err) {
    console.log(err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  selectPerPage.value = perPage;
  getExpenses(1);
});

const submitHandler = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  let amount = document.getElementById("amount");
  let desc = document.getElementById("desc");
  let category = document.getElementById("category");

  let expList = {
    amount: amount.value,
    desc: desc.value,
    category: category.value,
  };
  try {
    const exp = await axios.post(`${baseUrl}/expenses/add-expense`, expList, {
      headers: { Authentication: token },
    });
    console.log(exp.data);
    displayExpenses(exp.data);
    getExpenses(1);
    messageHandler("Expense Added Successfully", "success");
  } catch (err) {
    messageHandler(err, "error");
  }

  desc.value = "";
  amount.value = "";
  category.value = "Food";
};

const deleteHandler = async (e) => {
  const li = e.target.parentElement;
  const id = li.id;
  const token = localStorage.getItem("token");
  try {
    const res = await axios.delete(`${baseUrl}/expenses/delete-expense/${id}`, {
      headers: { Authentication: token },
    });
    getExpenses(1);
    messageHandler("Expense Deleted", "success");
  } catch (err) {
    messageHandler(err, "error");
  }
};

const downloadManager = async (e) => {
  try {
    const result = await axios.get(`${baseUrl}/expenses/download`, {
      headers: { Authentication: token },
    });
    if (result.status === 201) {
      const a = document.createElement("a");
      a.href = result.data.fileUrl;
      a.click();
      response = await axios.get(`${baseUrl}/expenses/filedownloads`, {
        headers: { Authentication: token },
      });
      const files = JSON.parse(response.data.files);
      fileDownloadDiv.style.display = "block";
      files.forEach((file) => displayFiles(file));

      messageHandler("File Downloaded Successfully", "success");
    } else {
      throw new Error(result.data.message);
    }
  } catch (err) {
    console.log(err);
    messageHandler(err.response.statusText, "error");
  }
};

const displayFiles = (file) => {
  const date = file.createdAt.split("T")[0];
  const tr = document.createElement("tr");
  tr.innerHTML += `<td>${date}</td>
                    <td><a href=${file.fileUrl}>${file.fileUrl}</a></td>`;
  fileDownloadBody.appendChild(tr);
  window.location.href = "#fileDownloads";
};

selectPerPage.addEventListener("change", () => {
  localStorage.setItem("perPage", selectPerPage.value);
  getExpenses(1);
});
downloadBtn.addEventListener("click", downloadManager);
form.addEventListener("submit", submitHandler);
