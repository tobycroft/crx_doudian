document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = "http://127.0.0.1";

    /* ========== DOM ========== */
    const loginBox = document.getElementById("loginBox");
    const userBox = document.getElementById("userBox");

    const loginAccount = document.getElementById("loginAccount");
    const loginPassword = document.getElementById("loginPassword");
    const captchaImg = document.getElementById("captchaImg");
    const captchaInput = document.getElementById("captcha");
    const stayOnline = document.getElementById("stayOnline");

    const btnLogin = document.getElementById("btnLogin");
    const btnLogout = document.getElementById("btnLogout");

    const uiUid = document.getElementById("ui_uid");
    const uiMail = document.getElementById("ui_mail");
    const btnWS = document.getElementById("btnWS");

    let ident = "";

    let currentExec = {};
    let historyExec = [];
    let countExec = 0;

    /* ========== 初始化入口 ========== */
    init();

    async function init() {
        const {uid, token} = await chrome.storage.sync.get(["uid", "token"]);
        // console.log("init:", uid, token);
        if (uid && token) {
            const ok = await checkUserInfo(uid, token);
            if (ok) return;

            // token 失效
            await chrome.storage.sync.remove(["uid", "token"]);
        }

        // 未登录状态
        showLogin();
        loadCaptcha();

    }

    /* ========== UI 切换 ========== */
    function showLogin() {
        loginBox.style.display = "block";
        userBox.style.display = "none";
    }

    function showUser(user) {
        uiUid.innerText = user.id;
        uiMail.innerText = user.mail;

        loginBox.style.display = "none";
        userBox.style.display = "block";
    }

    btnStatus.onclick = async () => {
        let switch_status = await chrome.storage.sync.get(["switch_status"]);
        if (switch_status.switch_status === 1) {
            await chrome.storage.sync.set({switch_status: 0});
        } else {
            await chrome.storage.sync.set({switch_status: 1});
        }
        showStatus();
    }

    async function showStatus() {
        let switch_status = await chrome.storage.sync.get(["switch_status"]);
        console.log("switch:", switch_status);
        if (switch_status.switch_status === undefined) {
            await chrome.storage.sync.set({switch_status: 0});
            switch_status.switch_status = 0;
        }
        if (switch_status.switch_status === 1) {
            document.getElementById("switch_status").innerText = "☑️";
        } else {
            document.getElementById("switch_status").innerText = "❌";
        }
    }

    /* ========== userinfo 校验 ========== */
    async function checkUserInfo(uid, token) {
        try {
            const resp = await fetch(BASE_URL + "/v1/user/info/get", {
                method: "POST",
                headers: {
                    "uid": uid,
                    "token": token
                }
            });

            const data = await resp.json();
            console.log("userinfo:", data);

            if (data.code === 0) {
                //在登录后开始执行比较好
                showUser(data?.data);
                showStatus();
                initWSStatus();
                return true;
            }
        } catch (err) {
            console.error("userinfo error:", err);
        }

        return false;
    }

    /* ========== 验证码 ========== */
    captchaImg.onclick = loadCaptcha;

    function loadCaptcha() {
        captchaImg.src = "loading.png";

        fetch(BASE_URL + "/v1/user/login/captcha?" + Date.now())
            .then(resp => resp.json())
            .then(data => {
                if (data?.data?.img) {
                    captchaImg.src = data.data.img;
                }
                ident = data?.data?.ident || "";
            })
            .catch(() => {
                captchaImg.src = "loading.png";
            });
    }

    /* ========== 登录 ========== */
    btnLogin.onclick = doLogin;

    async function doLogin() {
        const mail = loginAccount.value.trim();
        const password = loginPassword.value.trim();
        const captcha = captchaInput.value.trim();

        if (!mail || !password || !captcha) {
            alert("请填写完整登录信息");
            return;
        }

        const fd = new FormData();
        fd.append("mail", mail);
        fd.append("password", password);
        fd.append("ident", ident);
        fd.append("code", captcha);

        try {
            const resp = await fetch(BASE_URL + "/v1/user/login/auto", {
                method: "POST",
                body: fd
            });

            const data = await resp.json();
            console.log("login:", data);

            if (data.code === 0) {
                await chrome.storage.sync.set({
                    uid: data.data.uid,
                    token: data.data.token
                });

                showUser({
                    id: data.data.uid,
                    mail: mail
                });
            } else {
                alert(data.echo || "登录失败");
                loadCaptcha();
            }

        } catch (err) {
            alert("网络错误");
        }
    }

    /* ========== 退出登录 ========== */
    btnLogout.onclick = async () => {
        await chrome.storage.sync.remove(["uid", "token"]);
        showLogin();
        loadCaptcha();
    };

    const wsStatusSpan = document.getElementById("ws_status");
    const wsLoginSpan = document.getElementById("ws_login");

    chrome.runtime.onMessage.addListener((msg) => {
        switch (msg.action) {
            case "wsStatus":
                wsStatus = msg.status;
                wsStatusSpan.innerText = msg.status;
                break
            case "logStatus":
                logStatus = msg.status;
                wsLoginSpan.innerText = msg.status;
                break

            case "exec":
                currentExec = msg.status;
                countExec++;
                historyExec.push(msg.status)
                if (historyExec.length > 10) {
                    historyExec.shift();
                }
                break


        }
    });

    async function initWSStatus() {
        console.log("getWSStatus")
        try {
            chrome.runtime.sendMessage(
                {action: "getWSStatus"},
                (res) => {
                    if (res?.ok && res.data) {
                        wsStatusSpan.innerText = res.data;
                    }
                }
            );
        } catch (err) {
            console.error("initWSStatus error:", err);
        }
    }

    btnWS.onclick = () => {
        try {
            chrome.runtime.sendMessage({action: "toggleWS"});
        } catch (err) {
            console.error("initWS error:", err);
        }
    };

});
