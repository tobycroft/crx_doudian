document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = "http://127.0.0.1";
    const captchaImg = document.getElementById("captchaImg");

    // 页面加载后异步刷新验证码
    setTimeout(loadCaptcha, 0);

    // 点击刷新验证码
    captchaImg.onclick = () => loadCaptcha();

    // 点击登录
    document.getElementById("btnLogin").onclick = () => doLogin();
    let ident = "";

    // ======== 加载验证码 JSON → base64 转图片 =========
    function loadCaptcha() {
        // 加载中先显示默认图，不影响打开速度
        captchaImg.src = "loading.png";

        // 异步请求，不阻塞 popup
        fetch(BASE_URL + "/v1/user/login/captcha?" + Date.now())
            .then(resp => resp.json())
            .then(data => {
                console.log(data.data.ident);
                if (data?.data?.img) {
                    captchaImg.src = data.data.img; // base64 直接显示
                }
                ident = data.data.ident;
            })
            .catch(() => {
                // 出错仍显示默认图，不报错
                captchaImg.src = "loading.png";
            });
    }


    // ============= 登录 =============
    async function doLogin() {
        const body = {
            mail: loginAccount.value.trim(),
            password: loginPassword.value.trim(),
            captcha: captcha.value.trim(),
            stay: stayOnline.checked,
            ident: ident,
        };

        let fd = new FormData();
        fd.append("mail", body.mail);
        fd.append("password", body.password);
        fd.append("ident", body.ident);
        fd.append("code", body.captcha);

        try {
            const resp = await fetch(BASE_URL + "/v1/user/login/auto", {
                method: "POST",
                body: fd
            });

            const data = await resp.json();

            if (data.code === 0) {
                alert(data.echo);
            } else {
                alert(data.echo || "登录失败");
                loadCaptcha();
            }

        } catch (err) {
            alert("网络错误");
        }
    }

});
