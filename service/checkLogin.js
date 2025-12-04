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
