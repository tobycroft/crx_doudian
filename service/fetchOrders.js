
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