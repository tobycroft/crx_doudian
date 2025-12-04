console.log("后台启动");

importScripts(
    "service.js",
);

// 实际抓订单
async function fetchOrders() {
    try {
        const url = "https://fxg.jinritemai.com/api/order/searchlist?page=0&pageSize=10";

        const res = await fetch(url, {credentials: "include"});
        const json = await res.json();

        console.log("抓单成功：", json);

        return json;
    } catch (err) {
        console.error("抓单失败", err);
        return {error: err.toString()};
    }
}

// 检查抖店是否登录
async function checkLogin() {
    try {
        let cookies = await chrome.cookies.getAll({
            domain: "jinritemai.com"
        });

        let session = cookies.find(c => c.name === "sessionid");

        return {
            loggedIn: !!session,
            username: session ? "已登录账号（无法直接取用户名）" : null
        };

    } catch (e) {
        return {loggedIn: false};
    }
}
