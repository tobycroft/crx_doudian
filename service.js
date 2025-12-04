importScripts(
    "service/service.main.js",
);
// popup 请求抓订单
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "fetchOrders") {
        fetchOrders().then(data => sendResponse(data));
        return true; // 异步响应
    }

    if (msg.action === "checkLogin") {
        checkLogin().then(data => sendResponse(data));
        return true;
    }
});