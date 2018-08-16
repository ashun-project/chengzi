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

// detail
var params = window.location.search.split('?');
var defaultUrl = '';
var bodyer = document.getElementById('bodyer');
var mySpare = document.getElementById('my-spare');
var videoData = {};
if (params && params.length > 1) defaultUrl = params[1];
getHtml(defaultUrl);

function getHtml(url) {
    ajax({  
        type: "get",
          url: "/api" + url,
          beforeSend: function () {},
            //some js code 
        success: function (msg) {
            var reTag = /<link(?:.|\s)*?>|<body[^>]*>|<\/body>|<script(?:.|\s)*?<\/script>|<iframe(?:.|\s)*?<\/iframe>/ig;
            var cont = /<body(?:.|\s)*?<\/body>/g;
            var script = /<script(?:.|\s)*?<\/script>/g;
            var result = cont.exec(msg);
            var scriptResult = msg.match(script);
            var html = '';
            document.documentElement.scrollTop=document.body.scrollTop=0;
            if (scriptResult) {
                var str = scriptResult.join('').replace(/\'/g, '\"');
                var name = str.match(/mac_name=\"(?:.|\s)*?\"/g);
                var url = str.match(/mac_url=unescape\(\"(?:.|\s)*?\"\)/g);
                if (name && name[0]) videoData.name = name[0].replace(/\"|mac_name=/g, '');
                if (name && name[0]) videoData.url = url[0].replace(/\"|\)|mac_url=unescape\(/g, '');
            }
            if (result && result[0]) {
                html = result[0].replace(reTag,'');
            }
            mySpare.innerHTML = html;
            setTimeout(function() {
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
    var divEles = mySpare.children;
    var imgs = mySpare.querySelectorAll('img');
    var getA = mySpare.querySelectorAll('a');
    if (divEles && divEles.length) {
        // 去除a链接
        for (var i = 0; i < getA.length; i++) {
            var href = getA[i].getAttribute('href');
            getA[i].setAttribute('my-data', href);
            getA[i].removeAttribute('href');
        }
        // 添加完整的图片路径
        for (var i = 0; i < imgs.length; i++) {
            var src = imgs[i].getAttribute('src');
            imgs[i].removeAttribute('onerror');
            if (src.indexOf('http') === -1) {
                imgs[i].setAttribute('src', '//www.p2pzy1.com/' + src);
            }
            if (src.indexOf('.gif') > -1) {
                imgs[i].parentNode.removeChild(imgs[i]);
            }
        }
        var nav = mySpare.querySelector('#nav');
        var content = mySpare.querySelector('.tab-content');
        var str = '<div class="my-nav">' + nav.innerHTML + '</div>';
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
        reset(dem);
    }
}

// 注册事件
function getClike() {
    var nav = document.querySelectorAll('.bodyer .my-nav a');
    var content = document.querySelectorAll('.bodyer .my-cont a');
    successContent(nav, '2');
    successContent(content, '1');
    
    function successContent(list, type) {
        for (var i = 0; i < list.length; i++) {
            list[i].onclick = function (event) {
                var hrf = decodeURIComponent(this.getAttribute('my-data'));
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