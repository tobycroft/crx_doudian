/*********************************
 * Tab 切换
 *********************************/
document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    };
});

/*********************************
 * 登录/注册界面切换
 *********************************/
function showView(id) {
    document.querySelectorAll("#login .view").forEach(v => v.style.display = "none");
    document.getElementById(id).style.display = "block";
}


/*********************************
 * ======= 账号密码登录 =======
 *********************************/
document.getElementById("btnLogin").onclick = () => {
    const account = document.getElementById("loginAccount").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const stay = document.getElementById("stayOnline").checked;

    if (!account || !password) {
        alert("账号和密码不能为空");
        return;
    }

    chrome.runtime.sendMessage({
        action: "login",
        account,
        password,
        stay
    }, resp => {
        if (!resp) {
            alert("后台无响应");
            return;
        }
        if (resp.success) {
            loadUserInfo();
        } else {
            alert(resp.msg || "登录失败");
        }
    });
};


/*********************************
 * 检查登录状态（自动登录）
 *********************************/
function loadUserInfo() {
    chrome.runtime.sendMessage({action: "checkLogin"}, (resp) => {
        if (resp?.loggedIn) {
            document.getElementById("userInfoText").innerText =
                "当前账号：" + resp.username;
            showView("userInfoView");
        } else {
            showView("loginView");
        }
    });
}

/*********************************
 * 退出登录
 *********************************/
document.getElementById("btnLogout").onclick = () => {
    chrome.runtime.sendMessage({action: "logout"}, () => {
        showView("loginView");
    });
};

/*********************************
 * Debug 调试
 *********************************/
document.getElementById("btnFetch").onclick = () => {
    chrome.runtime.sendMessage({action: "fetchOrders"}, (resp) => {
        appendLog("响应: " + JSON.stringify(resp));
    });
};

function appendLog(msg) {
    const box = document.getElementById("logBox");
    box.textContent += msg + "\n";
    box.scrollTop = box.scrollHeight;
}

/*********************************
 * 启动自动检查登录状态
 *********************************/
loadUserInfo();
