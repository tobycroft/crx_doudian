console.log("后台启动");

importScripts(
    "service/fetchOrders.js",
    "service/checkLogin.js",
);

const Actions = {
    fetchOrders,
    checkLogin,
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

const WS_URL = "ws://127.0.0.1"
let ws = null;
let wsStatus = "disconnected"; // disconnected / connecting / connected / authenticated

function connectWS() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    wsStatus = "connecting";
    broadcastWSStatus();

    console.log("WS connecting:", WS_URL);
    ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
        wsStatus = "connected";
        broadcastWSStatus();
        console.log("WS connected");

        // 登录验证（如果需要）
        const {uid, token} = await chrome.storage.sync.get(["uid", "token"]);
        if (uid && token) {
            ws.send(JSON.stringify({
                type: "login",
                uid,
                token
            }));
        }
    };

    ws.onmessage = (evt) => {
        console.log("WS message:", evt.data);

        // 示例：登录确认
        try {
            const msg = JSON.parse(evt.data);
            if (msg.type === "login_ack" && msg.ok) {
                wsStatus = "authenticated";
                broadcastWSStatus();
            }
        } catch {
        }
    };

    ws.onerror = (err) => {
        console.error("WS error:", err);
    };

    ws.onclose = () => {
        console.warn("WS closed");
        wsStatus = "disconnected";
        broadcastWSStatus();
        ws = null;

        // 重连
        setTimeout(connectWS, 5000);
    };
}

// 通知 popup
function notifyPopup() {
    chrome.runtime.sendMessage({action: "wsStatus", status: wsStatus});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getWSStatus") {
        sendResponse({status: wsStatus});
        return;
    }
    // 其他 Actions 处理
});