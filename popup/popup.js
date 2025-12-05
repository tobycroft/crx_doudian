document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = "http://127.0.0.1";
    const captchaImg = document.getElementById("captchaImg");

    // 页面加载后异步刷新验证码
    setTimeout(loadCaptcha, 0);

    // 点击刷新验证码
    captchaImg.onclick = () => loadCaptcha();

    // 点击登录
    document.getElementById("btnLogin").onclick = () => doLogin();


    // ======== 加载验证码 JSON → base64 转图片 =========
    function loadCaptcha() {
        // 加载中先显示默认图，不影响打开速度
        captchaImg.src = "captcha_default.png";

        // 异步请求，不阻塞 popup
        fetch(BASE_URL + "/v1/index/captcha/get?" + Date.now())
            .then(resp => resp.json())
            .then(data => {
                if (data?.data?.img) {
                    captchaImg.src = data.data.img; // base64 直接显示
                }
            })
            .catch(() => {
                // 出错仍显示默认图，不报错
                captchaImg.src = "captcha_default.png";
            });
    }


    // ============= 登录 =============
    async function doLogin() {
        const body = {
            account: loginAccount.value.trim(),
            password: loginPassword.value.trim(),
            captcha: captcha.value.trim(),
            stay: stayOnline.checked,
        };

        try {
            const resp = await fetch(BASE_URL + "/v1/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await resp.json();

            if (data.success) {
                alert("登录成功");
            } else {
                alert(data.msg || "登录失败");
                loadCaptcha();
            }

        } catch (err) {
            alert("网络错误");
        }
    }

});
