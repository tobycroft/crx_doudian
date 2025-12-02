let ws = null;
let deviceId = localStorage.getItem('deviceId') || Math.random().toString(36).substr(2, 10);
localStorage.setItem('deviceId', deviceId);

// 建立 WebSocket 连接
function connectWS() {
    ws = new WebSocket("ws://127.0.0.1:8080/ws"); // 替换成你的 Golang 后端地址

    ws.onopen = () => {
        console.log("WS connected");
        ws.send(JSON.stringify({ type: 'register', device_id: deviceId }));
    };

    ws.onmessage = (msg) => {
        let data = JSON.parse(msg.data);
        if(data.type === "fetch_order") {
            fetchOrders();
        }
    };

    ws.onclose = () => {
        console.log("WS closed, retry in 3s");
        setTimeout(connectWS, 3000);
    };

    ws.onerror = (e) => {
        console.error("WS error", e);
        ws.close();
    };
}

// 抓抖店订单
async function fetchOrders() {
    try {
        const res = await fetch("https://order.doudian.com/order/list", {
            credentials: "include"
        });
        const json = await res.json();
        console.log("订单数据:", json);

        if(ws && ws.readyState === WebSocket.OPEN){
            ws.send(JSON.stringify({ type: "order_data", device_id: deviceId, payload: json }));
        }
    } catch (e) {
        console.error("抓单失败", e);
    }
}

// 定时抓单（1分钟一次）
chrome.alarms.create("pollOrders", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if(alarm.name === "pollOrders"){
        fetchOrders();
    }
});

// 启动
connectWS();
