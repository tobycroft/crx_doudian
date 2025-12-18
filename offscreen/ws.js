const WS_URL = "ws://opc.tuuz.ltd";
let ws = null;
let wsStatus = "未连接服务器，请点击下方连接";
let logStatus = "还未完成身份验证";


function connectWs() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    wsStatus = "连接中……请稍候……";
    broadcast();

    ws = new WebSocket(WS_URL);

    ws.onopen = async () => {
        wsStatus = "☑️连接服务器成功";
        broadcast();

        const {uid, token} = await requestAuth();
        if (uid && token) {
            logStatus = "身份验证中……请稍候……";
            broadcast();
            ws.send(JSON.stringify({
                    route: "login",
                    uid,
                    token
                })
            );
        } else {
            logStatus = "本地uidtoken不存在，无法完成身份验证";
            broadcast();
        }
    };

    ws.onmessage = (evt) => {
        try {
            chrome.runtime.sendMessage({
                action: "ws_message",
                data: evt.data
            });
        } catch (e) {
            chrome.runtime.sendMessage({
                action: "ws_err",
                data: e.toString()
            });
        }
    };

    ws.onclose = () => {
        wsStatus = "❌WS服务已断开稍后会自动重连";
        logStatus = "❌等待重连后再次验证";
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
        case "wsStatus":
            wsStatus = msg.status;
            break
        case "logStatus":
            logStatus = msg.status;
            break
        //核心发出消息的数据接口
        case "ws_send":
            // console.log("ws send:", msg.data);
            try {
                ws.send(msg.data);
            } catch (e) {
                chrome.runtime.sendMessage({
                    action: "ws_err",
                    data: e.toString()
                });
            }
            break



    }
});

function broadcast() {
    chrome.runtime.sendMessage({
        action: "wsStatus",
        status: wsStatus
    });
    chrome.runtime.sendMessage({
        action: "logStatus",
        status: logStatus
    })
}

async function requestAuth() {
    const res = await chrome.runtime.sendMessage({action: "getAuthForWS"});
    // console.log("auth res:", res);
    return res;
}