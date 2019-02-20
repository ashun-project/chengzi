// ajax
function ajax() {  
    var ajaxData = {    
        type: arguments[0].type || "GET",
            url: arguments[0].url || "",
            async: arguments[0].async || "true",
            data: arguments[0].data || null,
            dataType: arguments[0].dataType || "text",
            contentType: arguments[0].contentType || "application/x-www-form-urlencoded",
            beforeSend: arguments[0].beforeSend || function () {},
            success: arguments[0].success || function () {},
            error: arguments[0].error || function () {}  
    }; 
    ajaxData.beforeSend(); 
    var xhr = createxmlHttpRequest();
    try{
        xhr.responseType = ajaxData.dataType;  
    }catch (err) {
        console.log(err)
    };
    xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);   
    xhr.setRequestHeader("Content-Type", ajaxData.contentType);   
    xhr.send(convertData(ajaxData.data));   
    xhr.onreadystatechange = function () {     
        if (xhr.readyState == 4) {       
            if (xhr.status == 200) {
                ajaxData.success(xhr.response);      
            } else {        
                ajaxData.error();      
            }     
        }  
    } 
};
function createxmlHttpRequest() {   
    if (window.ActiveXObject) {     
        return new ActiveXObject("Microsoft.XMLHTTP");   
    } else if (window.XMLHttpRequest) {     
        return new XMLHttpRequest();   
    } 
}; 
function convertData(data) {  
    if (typeof data === 'object') {    
        var convertResult = "";     
        for (var c in data) {       
            convertResult += c + "=" + data[c] + "&";     
        }     
        convertResult = convertResult.substring(0, convertResult.length - 1);   
        return convertResult;  
    } else {    
        return data;  
    }
};

// 内容
var userCont = '<div class="modal my-login"><span class="close" onclick="closeModal()">X</span><h6 class="modal-tite">Wellcome</h6><div class="modal-body"><form action="" id="login-form"><input type="text" name="userName" placeholder="用户名"> <input type="password" name="password" placeholder="密码"></form></div><div class="modal-foot"><button onclick="getLogin()">登&nbsp;&nbsp;&nbsp;录</button><p><font color="red">还没有账号吗？</font><span onclick="showMOdel(&quot;register&quot;)"><font color="#1ab394">去注册</font></span></p></div></div><div class="modal my-register"><span class="close" onclick="closeModal()">X</span><h6 class="modal-tite">Wellcome</h6><div class="modal-body"><form action="" id="register-form"><input type="text" name="userName" placeholder="用户名"> <input type="password" name="password" placeholder="密码"> <input type="password" name="vaidPassword" placeholder="确认密码"></form></div><div class="modal-foot"><button onclick="getRegister()">注&nbsp;&nbsp;&nbsp;册</button><p><font color="red">已有账号吗？</font><span onclick="showMOdel(&quot;login&quot;)"><font color="#1ab394">去登入</font></span></p></div></div>';
var mask = document.getElementById('mask');
// 判断是否为登入状态
if (mask) {
    mask.innerHTML = userCont;
    mask.addEventListener('click', function (e) {
        var ev = e || window.event;
        var target = ev.target || ev.srcElement;
        var id = target.getAttribute('id');
        if (id && id == 'mask') {
            closeModal();
        }
    });
}

function closeModal() {
    var modal = document.getElementsByClassName('modal');
    var myBodyer = document.getElementsByClassName('bodyer')[0];
    for (var i = 0; i < modal.length; i++) {
        modal[i].style.display = 'none';
    }
    if (myBodyer) {
        myBodyer.setAttribute('id', '');
    }
    mask.style.display = 'none';
}
function showMOdel(type) {
    var loginMOdel = document.getElementsByClassName('my-login')[0];
    var registerMOdel = document.getElementsByClassName('my-register')[0];
    var myBodyer = document.getElementsByClassName('bodyer')[0];
    if(type === 'login') {
        loginMOdel.style.display = 'block';
        registerMOdel.style.display = 'none';
    } else {
        loginMOdel.style.display = 'none';
        registerMOdel.style.display = 'block';
    }
    if (myBodyer) {
        myBodyer.setAttribute('id', 'mr-top');
    }
    continueTest();
    mask.style.display = 'block';
}
function getLogin() {
    var loginForm = document.getElementById('login-form');
    var userName = loginForm.userName.value;
    var password = loginForm.password.value;
    var obj = {userName: userName, password: password };
    vaidParams(obj, '/login');
}
function getRegister() {
    var registerForm = document.getElementById('register-form');
    var userName = registerForm.userName.value;
    var password = registerForm.password.value;
    var vaidPassword = registerForm.vaidPassword.value;
    if (vaidPassword !== password) {
        alert('两次密码输入不一致');
        return;
    }
    var obj = {userName: userName, password: password };
    vaidParams(obj, '/register');
}
function vaidParams(obj, url) {
    var error = '';
    for (var key in obj) {
        if (!obj[key]) {
            error = '用户或密码不能为空';
        }
        if (obj[key].length > 12) {
            error = '用户或密码不可超过12位';
        }
        if (obj[key].length < 3) {
            error = '用户或密码不可小于3位';
        }
    }
    if (error) {
        alert(error);
        return;
    }
    var searchResult = window.location.search;
    if (searchResult) {
        obj.recommend = searchResult.split('?recommend=')[1];
    }
    ajax({  
        type: "post",
        url: url,
        data: obj,
        success: function (data) {
            var result = JSON.parse(data);
            if (result.error) {
                alert(result.error);
            } else {
                location.reload();
                // console.log(result)
            }
        },
        error: function () {
            alert('系统异常，操作失败');
        }
    });
}
function outLogin () {
    ajax({  
        type: "post",
        url: '/logout',
        beforeSend: function () {},
        success: function (data) {
            location.reload();
        },
        error: function () {
            alert('系统异常，操作失败');
        }
    });
}
function getRefresh() {
    var rotation = document.getElementsByClassName('refresh')[0];
    rotation.querySelector('img').className = 'rotation';
    ajax({
        type: "post",
        url: '/refreshLogin',
        success: function (data) {
            alert('刷新登入成功');
            location.reload();
        }
    });
}
function search (id) {
    var val = document.getElementById('search-value').value;
    var pathname = window.location.pathname;
    if (val) {
        window.location.href = '/1/'+val.substr(0, 10);
    } else {
        if (pathname !== '/') {
            window.location.href = '/';
        }
    }
}
function getSearchKeyup (e) {
    var event = e || window.event;
    if (event.keyCode == "13") {
        search();
    }
}

// var myiframe = document.getElementById('my-iframe');
// if (myiframe) {
//     var docum = myiframe.contentWindow.document;
//     var ev = docum.querySelector("video");
//     var width = parseInt(ev.getAttribute("width"));
//     var height = parseInt(ev.getAttribute("height")) - 50;
//     var widthcss = parseInt(ev.offsetWidth);
//     var hig = (height / width) * widthcss;
//     ev.style.height = hig+"px";
//     myiframe.style.height=hig+10+"px";
// }


var ev = document.querySelectorAll("video");
if (ev.length) {
    for(var j = 0; j < ev.length; j++) {
        var width = parseInt(ev[j].getAttribute("width"));
        var height = parseInt(ev[j].getAttribute("height")) - 50;
        var widthcss = parseInt(ev[j].offsetWidth);
        var hig = (height / width) * widthcss;
        ev[j].style.height = hig+"px";
    }
}

// 提示框
var testLook = document.getElementById('test-look');
if (testLook) {
    setTimeout(function () {
        testLook.style.zIndex = '10000';
        testLook.style.visibility = 'visible';
        testLook.style.opacity = '1';
        testLook.style.top = '100px';
    }, 1000);
}
function continueTest() {
    if (testLook) {
        testLook.style.zIndex = '-1';
        testLook.style.visibility = 'hidden';
        testLook.style.opacity = '0';
    }
}

// 公告
scrollNotice();
function scrollNotice () {
    var num = 1;
    var notice = document.getElementById('notice-cont');
    if (!notice) {
        return;
    }
    var p = notice.querySelectorAll('p');
    var np = '';
    if (p.length > 1) {
        setInterval(function () {
            notice.style.top = '-'+(25*num)+'px';
            num++;
            if ((num % p.length) === 0) {
                for (var i = 0; i < p.length; i++) {
                    np = document.createElement('p');
                    np.innerHTML = p[i].innerHTML;
                    notice.appendChild(np);
                }
            }
        }, 5000)
    }
}


//开通时间
var modalMember = document.getElementById('modal-member');
var memberParame = {};
function addTime() {
    var money = {'1': 3.3, '7': 9.9, '30': 26, '180': 120, '360': 200};
    var userName = document.getElementById('user-name').textContent;
    var userTime = document.getElementById('user-time').textContent;
    var userTotal = document.getElementById('user-total').textContent;
    var seleltTime = document.getElementById('select-time').value;
    var time = (Number(seleltTime)+1) * 24 * 60 * 60 * 1000;
    var startTiem = new Date().getTime() + time;
    var date = '';
    if (userTime) {
        var date = userTime.replace(/-/g, '/');
        if (new Date(date).getTime() > new Date().getTime()) {
            startTiem = new Date(date).getTime() + time;
        }
    }
    date = getFormatDate(startTiem);
    memberParame = {
        endDate: date,
        total: money[seleltTime] + Number(userTotal),
        userName: userName
    }
    modalMember.style.display = 'block';
}
function sureAddTme(cancel) {
    if (!memberParame || !memberParame.endDate) {
        alert('error');
        return;
    }
    if (cancel) {
        modalMember.style.display = 'none';
        return;
    }
    ajax({  
        type: "post",
        url: '/updateUser',
        data: memberParame,
        success: function (data) {
            var result = JSON.parse(data);
            if (result.error) {
                alert(result.error);
            } else {
                location.reload();
            }
        },
        error: function () {
            alert('系统异常，操作失败');
        }
    });
}
function getFormatDate(time) {
    var date = new Date(time);
    var str = '';
    var dateArr = [date.getFullYear(), '-', date.getMonth() + 1, '-', date.getDate()];
    dateArr.forEach(item => {
        if (typeof item === 'number' && item < 10) item = '0' + item;
        str += item;
    });
    return str;
}
function memberSearch () {
    var value = document.getElementById('member-search-value').value;
    var table = document.getElementById('my-table');
    var td = table.querySelectorAll('tbody tr td');
    if (value) {
        ajax({  
            type: "post",
            url: '/getUserList',
            data: {name: value},
            success: function (data) {
                var cont = JSON.parse(data);
                if (cont.error) {
                    alert(cont.error)
                } else {
                    var searchResult = cont.list.filter(function(item){
                        return value === item.userName;
                    });
                    if (searchResult[0]) {
                        td[0].innerHTML = searchResult[0].userName;
                        td[1].innerHTML = searchResult[0].endDate;
                        td[2].innerHTML = searchResult[0].total;
                    } else {
                        alert('没有找到该用户');
                    }
                }
            },
            error: function () {
                alert('系统异常，操作失败');
            }
        });
    }
}
function getKeyup(e) {
    var event = e || window.event;
    if (event.keyCode == "13") {
        memberSearch()
    }
}

var ua = navigator.userAgent;
var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
var isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
var isAndroid = ua.match(/(Android)\s+([\d.]+)/);
var isMobile = isIphone || isAndroid;
var host = window.location.host;

if (isMobile && window.location.host.indexOf('app') <= -1) {
    var downUrl = isAndroid ? 'http://'+ host + '/app/android.apk' : 'itms-services://?action=download-manifest&amp;amp;url=https://raw.githubusercontent.com/ashun-project/chengzi/master/public/app/iphone.plist';
    var div = document.createElement('div');
    var body = document.getElementsByTagName('body')[0];
    var html = '<p>下载APP，体验更多乐趣</p><a id="download-app" onclick="goDownload()" data-href="'+ downUrl +'">下载APP</a><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEkAAABHCAYAAABLeWqsAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkFCQzU1QzMzMjc4MjExRTg5OTAzOTNGOUNEREFENTU3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkFCQzU1QzM0Mjc4MjExRTg5OTAzOTNGOUNEREFENTU3Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QUJDNTVDMzEyNzgyMTFFODk5MDM5M0Y5Q0REQUQ1NTciIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QUJDNTVDMzIyNzgyMTFFODk5MDM5M0Y5Q0REQUQ1NTciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6C4iTNAAAIt0lEQVR42uyc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" alt="">'
    div.className = 'tip-go-app';
    div.innerHTML = html;
    body.appendChild(div)
    body.style.marginBottom = '2.4rem';
    div.querySelector('img').onclick = function () {
        div.parentNode.removeChild(div);
    }
}

function goDownload() {
    var eventDownLoad = document.getElementById('download-app');
    var hrf = eventDownLoad.getAttribute('data-href');
    var searchResult = window.location.search;
    var recommend = '';
    if (searchResult) {
        recommend = searchResult.split('?recommend=')[1];
    }
    if (recommend) {
        ajax({  
            type: "post",
            url: '/downLadIntegral',
            data: {recommend: recommend},
            success: function (data) {
                console.log('添加成功');
            },
            error: function () {
                alert('系统异常，操作失败');
            }
        });
    }
    if(isIphone) {
        window.open(hrf)
    } else{
        window.location.href = hrf;
    }
}

var goExchangeing = '1';
function goExchange() {
    var value = document.getElementById('kami-value').value;
    if (value) {
        if (goExchangeing == '2') {
            return;
        }
        goExchangeing = '2';
        ajax({  
            type: "post",
            url: '/kamiUpdateUser',
            data: {kami: value},
            success: function (data) {
                var cont = JSON.parse(data);
                if (cont.error) {
                    alert(cont.error)
                    goExchangeing = '1';
                } else {
                    alert('兑换成功');
                    location.reload();
                }
            },
            error: function () {
                alert('系统异常，操作失败');
                goExchangeing = '1';
            }
        });
    } else {
        alert('请输入卡密');
    }
}

function goCopy() {
    var Url2=document.getElementById("copy-cont");
    Url2.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
    alert('复制成功，去发送给好友吧');
}

function exchange () {
    var integral = Number(document.getElementById('user-integral').innerText);
    if (integral && integral > 0) {
        ajax({  
            type: "post",
            url: '/exchange',
            data: {value: integral},
            success: function (data) {
                var cont = JSON.parse(data);
                if (cont.error) {
                    alert(cont.error)
                } else {
                    // alert('success')
                    alert('兑换成功');
                    location.reload();
                }
            },
            error: function () {
                alert('系统异常，操作失败');
            }
        });
    } else {
        alert('暂无积分兑换，请先分享链接');
    }
}