console.log("后台启动");

importScripts(
    "service/fetchOrders.js",
    "service/checkLogin.js",
);

const Actions = {
    fetchOrders,
    checkLogin,
    getCoupon,
    syncOrders,
    // 未来无限扩展
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const fn = Actions[msg.action];

    if (!fn) {
        sendResponse({error: "Unknown action: " + msg.action});
        return;
    }

    Promise.resolve(fn(msg.data))
        .then(res => sendResponse({ok: true, data: res}))
        .catch(err => sendResponse({ok: false, error: err.toString()}));

    return true; // 异步
});