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

// detail
let params = window.location.search.split('?');
let defaultUrl = '';
let bodyer = document.getElementById('bodyer');
let mySpare = document.getElementById('my-spare');
let videoData = {};
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
            let script = /<script(?:.|\s)*?<\/script>/g;
            let result = cont.exec(msg);
            let scriptResult = msg.match(script);
            let html = '';
            document.documentElement.scrollTop=document.body.scrollTop=0;
            if (scriptResult) {
                let str = scriptResult.join('').replace(/\'/g, '\"');
                let name = str.match(/mac_name=\"(?:.|\s)*?\"/g);
                let url = str.match(/mac_url=unescape\(\"(?:.|\s)*?\"\)/g);
                if (name && name[0]) videoData.name = name[0].replace(/\"|mac_name=/g, '');
                if (name && name[0]) videoData.url = url[0].replace(/\"|\)|mac_url=unescape\(/g, '');
            }
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
    });
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
                imgs[i].parentNode.removeChild(imgs[i]);
            }
        }
        let nav = mySpare.querySelector('#nav');
        let content = mySpare.querySelector('.tab-content');
        let str = '<div class="my-nav">' + nav.innerHTML + '</div>';
        str += '<div class="my-title">'+ videoData.name +'</div>';
        if (videoData.url) {
            str += '<div class="my-video"><iframe src="'+ unescape(videoData.url) +'" height="100%" width="100%" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="no"></iframe></div>';
        }
        str += '<div id="my-video-guding"></div>';
        str += '<div class="my-cont">' + content.innerHTML+'</div>';
        bodyer.innerHTML = str;
        mySpare.parentNode.removeChild(mySpare);
        getClike();
    } else {
        reset(dem)
    }
}

// 注册事件
function getClike() {
    let nav = document.querySelectorAll('.bodyer .my-nav a');
    let content = document.querySelectorAll('.bodyer .my-cont a');
    successContent(nav, '2');
    successContent(content, '1');
    
    function successContent(list, type) {
        for (let i = 0; i < list.length; i++) {
            list[i].onclick = function (event) {
                let hrf = decodeURIComponent(this.getAttribute('my-data'));
                if (type === '1') {
                    window.location.href = '/detail.html?'+hrf;
                } else {
                    if (hrf === '/') {
                        window.location.href = hrf;
                    } else {
                        window.location.href = '/?'+hrf;
                    }
                }
                event.cancelBubble = true;
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }
}