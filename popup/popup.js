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

document.getElementById("gotoRegister").onclick = () => showView("registerView");
document.getElementById("gotoLogin").onclick = () => showView("loginView");

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
 * ======= 邮箱验证码 登录 =======
 *********************************/
document.getElementById("btnSendLoginCode").onclick = () => {
    const email = document.getElementById("emailLoginInput").value.trim();
    if (!email) {
        alert("请输入邮箱");
        return;
    }

    chrome.runtime.sendMessage({
        action: "sendEmailCodeLogin",  // ★ 留给你实现
        email
    }, resp => {
        if (resp && resp.success) {
            alert("验证码已发送");
        } else {
            alert(resp?.msg || "发送失败");
        }
    });
};

document.getElementById("btnEmailLogin").onclick = () => {
    const email = document.getElementById("emailLoginInput").value.trim();
    const code = document.getElementById("emailLoginCode").value.trim();

    if (!email || !code) {
        alert("请输入邮箱和验证码");
        return;
    }

    chrome.runtime.sendMessage({
        action: "loginByEmail",  // ★ 留给你实现
        email,
        code
    }, resp => {
        if (resp?.success) {
            loadUserInfo();
        } else {
            alert(resp?.msg || "验证码登录失败");
        }
    });
};

/*********************************
 * ======= 注册 （账号+密码+邮箱验证码） =======
 *********************************/
document.getElementById("btnSendRegCode").onclick = () => {
    const email = document.getElementById("regEmail").value.trim();
    if (!email) {
        alert("请输入邮箱");
        return;
    }

    chrome.runtime.sendMessage({
        action: "sendEmailCodeRegister",  // ★ 留给你实现
        email
    }, resp => {
        alert(resp?.success ? "验证码已发送" : (resp?.msg || "发送失败"));
    });
};

document.getElementById("btnRegister").onclick = () => {
    const acc = document.getElementById("regAccount").value.trim();
    const p1 = document.getElementById("regPass1").value.trim();
    const p2 = document.getElementById("regPass2").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const code = document.getElementById("regEmailCode").value.trim();

    if (!acc || !p1 || !p2 || !email || !code) {
        alert("请填写完整注册信息");
        return;
    }
    if (p1 !== p2) {
        alert("两次密码不一致");
        return;
    }

    chrome.runtime.sendMessage({
        action: "registerWithEmail",  // ★ 留给你实现
        account: acc,
        password: p1,
        email,
        code
    }, resp => {
        if (resp?.success) {
            alert("注册成功，请登录");
            showView("loginView");
        } else {
            alert(resp?.msg || "注册失败");
        }
    });
};

/*********************************
 * 检查登录状态（自动登录）
 *********************************/
function loadUserInfo() {
    chrome.runtime.sendMessage({ action: "checkLogin" }, (resp) => {
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
    chrome.runtime.sendMessage({ action: "logout" }, () => {
        showView("loginView");
    });
};

/*********************************
 * Debug 调试
 *********************************/
document.getElementById("btnFetch").onclick = () => {
    chrome.runtime.sendMessage({ action: "fetchOrders" }, (resp) => {
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
