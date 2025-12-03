// Tab 切换
document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-page").forEach(p => p.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    };
});

// 点击抓订单按钮
document.getElementById("btnFetch").onclick = () => {
    chrome.runtime.sendMessage({ action: "fetchOrders" }, (resp) => {
        appendLog("响应: " + JSON.stringify(resp));
    });
};

// 输出日志到 UI
function appendLog(msg) {
    const box = document.getElementById("logBox");
    box.textContent += msg + "\n";
    box.scrollTop = box.scrollHeight;
}

// 检查登录状态
document.getElementById("btnCheckLogin").onclick = () => {
    chrome.runtime.sendMessage({ action: "checkLogin" }, (resp) => {
        const div = document.getElementById("loginInfo");
        div.innerText = resp.loggedIn
            ? "当前账号：" + resp.username
            : "未登录抖店";
    });
};

// 初始化登录状态
document.getElementById("btnCheckLogin").click();
