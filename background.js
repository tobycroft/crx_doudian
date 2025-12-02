let deviceId = localStorage.getItem('deviceId') || Math.random().toString(36).substr(2, 10);
localStorage.setItem('deviceId', deviceId);

// 点击插件图标触发
chrome.action.onClicked.addListener(() => {
    console.log("扩展图标点击，触发抓单");
    fetchOrders();
});

// 抓抖店订单
async function fetchOrders() {
    try {
        const res = await fetch("https://fxg.jinritemai.com/api/order/searchlist?page=0&pageSize=10&compact_time%5Bselect%5D=create_time_start%2Ccreate_time_end&order_by=create_time&order=desc", {
            credentials: "include"
        });
        const json = await res.json();
        console.log("【抓单结果】", json);  // 全部打印到 console
    } catch (e) {
        console.error("抓单失败", e);
    }
}

// 如果想保留定时抓单，可以保留下面的定时器
// chrome.alarms.create("pollOrders", { periodInMinutes: 1 });
// chrome.alarms.onAlarm.addListener((alarm) => {
//     if(alarm.name === "pollOrders"){
//         fetchOrders();
//     }
// });
