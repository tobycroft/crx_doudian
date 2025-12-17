console.log("后台启动");

importScripts(
    "service/fetchOrders.js",
    "service/checkLogin.js",
    "service/connectWs.js"
);

const Actions = {
    fetchOrders,
    checkLogin,
    connectWs: async () => {
        await ensureOffscreen();
        chrome.runtime.sendMessage({ target: "offscreen", action: "connectWs" });
    },

    toggleWS: async () => {
        await ensureOffscreen();
        chrome.runtime.sendMessage({ target: "offscreen", action: "toggleWS" });
    },

    getWSStatus: async () => {
        await ensureOffscreen();
        chrome.runtime.sendMessage({ target: "offscreen", action: "getWSStatus" });
    }
};


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const fn = Actions[msg.action];
    if (!fn) {
        sendResponse({ error: "Unknown action" });
        return;
    }

    Promise.resolve(fn(msg.data))
        .then(res => sendResponse({ ok: true, data: res }))
        .catch(err => sendResponse({ ok: false, error: err.toString() }));

    return true;
});


async function ensureOffscreen() {
    const exists = await chrome.offscreen.hasDocument();
    if (exists) return;

    await chrome.offscreen.createDocument({
        url: "offscreen/offscreen.html",
        reasons: ["BLOBS"],
        justification: "Keep WebSocket alive"
    });
}