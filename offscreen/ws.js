const WS_URL = "ws://127.0.0.1";
let ws = null;
let wsStatus = "disconnected";

function connectWs() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    wsStatus = "connecting";
    broadcast();

    ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
        wsStatus = "connected";
        broadcast();

        const {uid, token} = await requestAuth();
        if (uid && token) {
            console.log("logining")
            ws.send(JSON.stringify({
                type: "login",
                uid,
                token
            }));
        }else{
            console.log("logining failed");
        }
    };

    ws.onmessage = (evt) => {
        try {
            const msg = JSON.parse(evt.data);
            if (msg.type === "login_ack" && msg.ok) {
                wsStatus = "authenticated";
                broadcast();
            }
        } catch {
        }
    };

    ws.onclose = () => {
        wsStatus = "disconnected";
        broadcast();
        ws = null;
        setTimeout(connectWs, 5000);
    };
}

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.target !== "offscreen") return;

    switch (msg.action) {
        case "connectWs":
            connectWs();
            break;
        case "toggleWS":
            if (ws) ws.close();
            else connectWs();
            break;
        case "getWSStatus":
            broadcast();
            break;
    }
});

function broadcast() {
    chrome.runtime.sendMessage({
        action: "wsStatus",
        status: wsStatus
    });
}

async function requestAuth() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: "getAuthForWS"
        }, resolve);
    });
}