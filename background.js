chrome.action.onClicked.addListener(() => {
    console.log("插件图标被点击，开始抓取订单…");

    const url = "https://fxg.jinritemai.com/api/order/searchlist?page=0&pageSize=10&compact_time%5Bselect%5D=create_time_start%2Ccreate_time_end&order_by=create_time&order=desc&tab=all";

    fetch(url, {
        method: "GET",
        credentials: "include"   // ⬅⬅ 必须带上，才能附带抖店登录 cookie
    })
        .then(async res => {
            console.log("状态码：", res.status);

            let text = await res.text();
            console.log("响应内容：", text);

            try {
                let json = JSON.parse(text);
                console.log("JSON 解析：", json);
            } catch (e) {
                console.log("返回不是 JSON");
            }
        })
        .catch(err => {
            console.error("请求失败：", err);
        });
});
