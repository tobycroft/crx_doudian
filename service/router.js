let currentExec = {};
let historyExec = [];
let countExec = 0;

async function router(data) {
    // console.log("Routing data:", data);
    const json = JSON.parse(data)
    switch (json.route) {
        case "route":
            break;

        case "login":
            logStatusRet(json.echo);
            // if (json.code === 0) {
            //     console.log("登录成功")
            // } else {
            //     console.log("登录失败：", json.echo)
            // }
            break;

        case "ping":
        case "pong":
            if (json.code === 0) {
                setTimeout(() => {
                    sendData(JSON.stringify({
                        route: "ping",
                        echo: "pong"
                    }))
                }, 10000)
            }
            break;

        default:
            console.log("Unknown route:", json.route);
            break;
    }
}

function logStatusRet(ret) {
    return chrome.runtime.sendMessage({
        target: "offscreen",
        action: "logStatus",
        status: ret
    })
}

function sendData(data) {
    return chrome.runtime.sendMessage({
        target: "offscreen",
        action: "ws_send",
        data: data
    })
}

function execCommand(data) {
    return chrome.runtime.sendMessage({
        target: "offscreen",
        action: "exec",
        data: data
    })
}