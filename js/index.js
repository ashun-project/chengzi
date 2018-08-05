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
    xhr.responseType = ajaxData.dataType;  
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
// 判断是不是手机端
let ua = navigator.userAgent;
let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
let isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);
let isAndroid = ua.match(/(Android)\s+([\d.]+)/);
var isMobile = isIphone || isAndroid;
let params = window.location.search.split('?');
let defaultUrl = '';
let bodyer = document.getElementById('bodyer');
let mySpare = document.getElementById('my-spare');
if (params && params.length > 1) defaultUrl = params[1];
getHtml(defaultUrl);

function getHtml(url) {
    ajax({  
        type: "get",
          url: "/api" + url,
          beforeSend: function () {},
            //some js code 
        success: function (msg) {
            let reTag = /<body[^>]*>|<\/body>|<script(?:.|\s)*?<\/script>|<iframe(?:.|\s)*?<\/iframe>/ig;
            let cont = /<body(?:.|\s)*?<\/body>/g;
            let result = cont.exec(msg);
            let html = '';
            
            document.documentElement.scrollTop=document.body.scrollTop=0;
            if (result && result[0]) {
                html = result[0].replace(reTag,'');
            }
            mySpare.innerHTML = html;
            setTimeout(() => {
                reset();
            }, 30);
        },
        error: function () {    
            alert('获取资源失败，请切换其它资源');
            window.location.href = 'http://xjb520.com';
        }
    })
}
// 去除元素
function reset(dem) {
    // 过滤元素下载链接
    let divEles = mySpare.children;
    let imgs = mySpare.querySelectorAll('img');
    let getA = mySpare.querySelectorAll('a');
    if (divEles && divEles.length) {
        // 去除a链接
        for (var i = 0; i < getA.length; i++) {
            let href = getA[i].getAttribute('href');
            getA[i].setAttribute('my-data', href);
            getA[i].removeAttribute('href');
        }
        // 添加完整的图片路径
        for (var i = 0; i < imgs.length; i++) {
            let src = imgs[i].getAttribute('src');
            imgs[i].removeAttribute('onerror');
            if (src.indexOf('http') === -1) {
                imgs[i].setAttribute('src', '//www.p2pzy1.com/' + src);
            }
            if (src.indexOf('.gif') > -1) {
                imgs[i].parentNode.removeChild(imgs[i])
            }
        }
        let nav = mySpare.querySelector('#nav');
        let content = mySpare.querySelector('#content');
        bodyer.innerHTML = ('<div class="my-nav">' + nav.innerHTML + '</div><div class="my-cont">' + content.innerHTML+'</div>');
        mySpare.parentNode.removeChild(mySpare);
        getClike();
    } else {
        reset(dem);
    }
}

// 注册事件
function getClike() {
    let content = document.querySelectorAll('.bodyer a');
    successContent(content);
    
    function successContent(list) {
        for (let i = 0; i < list.length; i++) {
            list[i].onclick = function (event) {
                let hrf = decodeURIComponent(this.getAttribute('my-data'));
                let type = setType(this.parentNode);
                if (type === '1') {
                    if (hrf === '/') {
                        window.location.href = hrf;
                    } else {
                        window.location.href = '/?'+hrf;
                    }
                } else {
                    if (isMobile) {
                        window.location.href = '/detail.html?' + hrf;
                    } else {
                        window.open('/detail.html?' + hrf);
                    }
                }
                event.cancelBubble = true;
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }
    // 循环10次获取父元素    
    function setType (parent){
        let num = 0;
        let type = '1';
        getParent(parent);  
        function getParent(p) {
            if (p.nodeName === 'LI' && p.id.indexOf('video') > -1) {
                type = '2';
            } else {
                if(num >= 3 || !p.parentNode) return;
                num++;
                getParent(p.parentNode);
            }
            
        }
        return type;
    }
}