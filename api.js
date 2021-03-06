var express = require('express');
var router = express.Router();
var fs = require("fs");
var mysql = require('mysql');
var encryption = require('./md5');
var poolUser = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'waibao'//user //waibao
});
var poolVip = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'vip'
});
var marqueeList = ['小提醒:充值后若无法观看联系客服2982501851', '小福利:累计充值满300元永久免费哦', '小公告:为防止被墙我们的永久域名是www.8llh.com', '小提示:找不到喜欢的吗？搜索有你想要哦', '小条件:只有充值后才能观看完整版哦'];

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};
function setRecommend(req, recommend, integral) {
    var searchSql = 'SELECT * FROM list where userName = "'+ recommend + '"';
    var ip = getClientIP(req);
    poolUser.getConnection(function (err, conn) {
        conn.query(searchSql, function (err3, result3) {
            if (result3[0]) {
                var userip = result3[0].ip ? result3[0].ip.split(',') : [];
                var type = 'ip';
                if (integral === 1) {
                    userip = result3[0].download ? result3[0].download.split(',') : [];
                    type = 'download'
                }
                if(userip.indexOf(ip) < 0) {    
                    userip.push(ip);
                    var updateSql = 'update list set '+ type +' = "'+ userip.join(',') +'",integral = "'+ ((Number(result3[0].integral)||0)+integral) +'" where userName = "'+ recommend + '"';
                    conn.query(updateSql, function (err, result) {});
                }
            }
            conn.release();
        });
    });
}
function vaidParams(userName, password) {
    var error = '';
    if (!userName || !password) {
        error = '用户或密码不能为空';
    }
    if (userName.length > 12 || password.length > 12) {
        error = '用户或密码不可超过12位';
    }
    if (userName.length < 3 || password.length < 3) {
        error = '用户或密码不可小于3位';
    }
    return error;
}
router.all("*", function (req, res, next) {
    var userAgent = req.headers["user-agent"] || 'iphone';
    var deviceAgent = userAgent.toLowerCase();
    var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    if (agentID) {
        req.zd = "mobile";
    } else {
        req.zd = "pc";
    }
    next();
})
// router.get('/', getIndex);
// router.get('/:page', getIndex);
router.get('/:page?/:title?', function (req,res) {
    if (req.url == '/favicon.ico' || (req.params.title && req.params.title.indexOf('javascript') > -1)) {
        res.send('');
    } else {
        if (req.params.page === 'detail' && Number(req.params.title)) {
            getDetail(req,res);
        } else if (req.params.page === 'user' && req.params.title === 'info') {
            getMine(req,res);
        } else if (req.params.page === 'user' && req.params.title === 'member') {
            // getMember(req,res);
        } else if (req.params.page === 'user' && req.params.title === 'share') {
            getShaer(req,res);
        }  else if (req.params.page === 'user' && req.params.title === 'kami'){
            getKami(req,res);
        } else {
            getIndex(req,res);
        }
    }
});
function getIndex(req,res) {
    var currentReq = Number(req.params.page) || 1;
    var titleReq = req.params.title || '';
    var limitBefore = ((currentReq - 1) * 12);
    var reNum = Math.floor(Math.random()*10+1) * 12;
    var sql = 'SELECT * FROM list order by createTime desc limit ' + (limitBefore + ',' + 12);
    var count = 'SELECT COUNT(*) FROM list';
    var recommond = 'SELECT * FROM list order by createTime desc limit ' + (reNum + ',' + 12);
    if (titleReq) {
        sql = 'SELECT * FROM list where title like "' +'%'+ titleReq +'%'+ '" order by createTime desc limit ' + (limitBefore + ',' + 12);
        count = 'SELECT COUNT(*) FROM list where title like "' +'%'+ titleReq +'%'+ '"';
    }
    poolVip.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('[SELECT ERROR] - ', err.message, 'sql', sql);
                conn.release();
            } else {
                conn.query(recommond, function (err1, recommend) {
                    if (err1) {
                        console.log('recommond1- ', err1.message);
                        conn.release();
                    } else {
                        conn.query(count, function (errC, total) {
                            var listObj = {
                                listData: result,
                                pageTitle: (titleReq || '茄子') + (currentReq > 1 ? '-第' + currentReq + '页' : ''),
                                pageKeyword: '茄子,茄子图片,动漫茄子,茄子酱',
                                pageDescrition: '茄子有你,茄子吧给你想要哦',
                                marqueeList: marqueeList,
                                recommend: recommend,
                                page: getPage(Number(total[0]['COUNT(*)']) || 0, currentReq, titleReq, req.headers['host']),
                                currentPage: currentReq,
                                titlePage: titleReq,
                                userInfo: req.session.loginUser,
                                host: 'http://'+req.headers['host'],
                                zd: req.zd
                            }
                            res.render('index', listObj);
                            conn.release();
                        })
                    }
                });
            }
        });
    });
};

function getPage(total, currentPage, type, host) {
    var totalPage = 0;//总页数
    var pageSize = 12;//每页显示行数
    var pageUrl = 'http://'+ host+'/';
    var pageTitle = type? '/'+type : '';
    //总共分几页
    if(total/pageSize > parseInt(total/pageSize)){
        totalPage=parseInt(total/pageSize)+1;
    }else{
        totalPage=parseInt(total/pageSize);
    }
    var tempStr = "<span>共"+totalPage+"页</span>";
    if(currentPage>1){
        tempStr += "<a href="+ pageUrl + '1' + pageTitle + ">首页</a>";
        tempStr += "<a href="+ pageUrl + (currentPage-1) + pageTitle +">上一页</a>"
    }else{
        tempStr += "<span class='btn'>首页</span>";
        tempStr += "<span class='btn'>上一页</span>";
    }

    if (currentPage > 5 && currentPage < (totalPage -5)) {
        for(var pageIndex= currentPage - 5; pageIndex<currentPage+5;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + pageIndex + pageTitle +">"+ pageIndex +"</a>";
        }
    } else if (currentPage > (totalPage -5) && totalPage >= 10){
        for(var pageIndex= (totalPage - 9); pageIndex < totalPage+1;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + pageIndex + pageTitle +">"+ pageIndex +"</a>";
        }
    } else if (currentPage <= 5 && totalPage > 10) {
        for(var pageIndex= 1; pageIndex <= 10;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + pageIndex + pageTitle +">"+ pageIndex +"</a>";
        }
    } else {
        for(var pageIndex= 1; pageIndex <= totalPage;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ pageUrl + pageIndex + pageTitle +">"+ pageIndex +"</a>";
        }
    }

    if(currentPage<totalPage){
        tempStr += "<a href="+ pageUrl + (currentPage+1) + pageTitle +">下一页</a>";
        tempStr += "<a href="+ pageUrl + totalPage + pageTitle +">尾页</a>";
    }else{
        tempStr += "<span class='btn'>下一页</span>";
        tempStr += "<span class='btn'>尾页</span>";
    }

    return tempStr;
}


function getDetail (req,res) {
    var testLook = {};
    var user = req.session.loginUser;
    var sql = 'SELECT * FROM defDetail where createTime = ' + '"' + req.params.title +'"';
    var reNum = Math.floor(Math.random()*20+1) * 12;
    var recommond = 'SELECT * FROM list order by createTime desc limit ' + (reNum + ',' + 12);
    poolVip.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('[detail ERROR] - ', err.message);
                // res.send('error');
                conn.release();
            } else {
                conn.query(recommond, function (err1, recommend) {
                    if (err1) {
                        console.log('detail1- ', err1.message);
                        // res.render('index')
                    } else {
                        var resultO = '';
                        if (!result[0]) {
                            resultO = {};
                        } else {
                            resultO = JSON.parse(JSON.stringify(result[0]));
                        }
                        // var vio = resultO.video ? resultO.video.split(',') : [];
                        var addStr = '?end=120';//?end=120
                        if (user) {
                            testLook = {id: 'test-look', cont: '你目前还不是VIP会员，只能试看两分钟。', goVip: true};
                            if (user.endDate) {
                                var time = new Date().getTime();
                                var endTime = new Date(user.endDate.replace(/-/g, '/')).getTime();
                                if (endTime > time || Number(user.total) > 300) {
                                    testLook = {};
                                    addStr = '';
                                }
                            }
                        } else {
                            testLook = {id: 'test-look', cont: '你目前还没有登入，只能试看两分钟。', goVip: ''};
                        }
                        // for(var k = 0; k < vio.length; k++) {
                        //     var slpUrl = vio[k].split('/');
                        //     var slpUrl2 = 'http://www.onepussy.club/video/list/'+slpUrl[slpUrl.length-1];
                        //     if (addStr) {
                        //         vio[k] = slpUrl2;
                        //     } else {
                        //         vio[k] = slpUrl2.split('?end=120')[0];
                        //     }
                        // }
                        if (resultO.video) {
                            var spt = resultO.video.split('/');
                            resultO.video = spt[spt.length-1].split('.')[0]
                        }
                        var listObj = {
                            videoData: resultO,
                            pageTitle: resultO.title ? resultO.title.replace(/[在线]|【在线】/, '') : '资源不存在',
                            pageKeyword: resultO.title || '资源不存在',
                            pageDescrition: '茄子有你，茄子吧给你想要哦',
                            marqueeList: marqueeList,
                            recommend: recommend.slice(0,8),
                            userInfo: user,
                            testLook: testLook,
                            host: 'http://'+req.headers['host']
                        }
                        res.render('detail', listObj);
                    }
                    conn.release();
                });
            }
        });
    });
};

function getMine (req, res) {
    var user = req.session.loginUser || {};
    var userLevel = '普通会员';
    var expiryTime = '已到期';
    if (user && user.endDate) {
        var endTime = new Date(user.endDate.replace(/-/g, '/')).getTime();
        if (endTime > new Date().getTime() || Number(user.total) > 300) {
            userLevel = 'VIP会员';
            expiryTime = Number(user.total) > 300 ? '永久' : user.endDate;
        }
    }
    var listObj = {
        pageTitle: user.userName ? user.userName+'-茄子个人中心' : '茄子个人中心',
        pageKeyword: user.userName ? user.userName+'-个人中心' : '个人中心',
        pageDescrition: '茄子有你，茄子吧给你想要哦',
        userName: user.userName || '无',
        userLevel: userLevel,
        total: user.total || '0',
        integral: user.integral || '0',
        expiryTime: expiryTime,
        host: 'http://'+req.headers['host']
    }
    res.render('mine', listObj);
}

function getKami (req, res) {
    var user = req.session.loginUser;
    var userList = ['ashunadmin', 'ahaoadmin'];
    var sql = 'SELECT * FROM kami';
    var listObj = {
        listData: [],
        pageTitle: '卡密',
        pageKeyword: '卡密',
        pageDescrition: '网红萝莉有你，萝莉吧给你想要哦',
        user: user,
        host: 'http://'+req.headers['host']
    }
    if(user && userList.indexOf(user.userName) > -1) {
        poolUser.getConnection(function (err, conn) {
            if (err) console.log("POOL userlist-register==> " + err);
            conn.query(sql, function (err, result) {
                listObj.listData = result;
                res.render('kami', listObj);
                conn.release();
            });
        });
    } else {
        res.render('kami', listObj);
    }
} 

function getShaer(req, res){
    var user = req.session.loginUser||{};
    res.render('share');
}

// 卡密更新用户
router.post('/kamiUpdateUser', function (req, res, next) {
    var kami = req.body.kami;
    var login = req.session.loginUser;
    var sql = 'SELECT * FROM kami where kami = "' + kami + '"';
    if (kami.length < 5) {
        res.json({error: '无效卡密'});
        return;
    }
    if (login) {
        poolUser.getConnection(function (err, conn) {
            if (err) console.log("POOL userlist-register==> " + err);
            conn.query(sql, function (err, result) {
                if(result[0]) {
                    var time = (Number(result[0].day)+1) * 24 * 60 * 60 * 1000;
                    var startTiem = new Date().getTime() + time;
                    var date = '';
                    console.log(login.date);
                    if (login.date) {
                        if (new Date(login.date).getTime() > new Date().getTime()) {
                            startTiem = new Date(login.date).getTime() + time;
                        }
                    }
                    date = getFormatDate(startTiem);
                    var upSql = 'update list set endDate = "'+ date +'" where userName = "'+ login.userName + '"';
                    var delSql = 'delete from kami where kami = "' + kami + '"';
                    var infoSql = 'INSERT INTO usedkami(kami,ip,user,agent) VALUES (?,?,?,?)';
                    conn.query(upSql, function (err, result1) {
                        req.session.loginUser.endDate = date;
                        conn.query(delSql, function (err, result2) {});
                        conn.query(infoSql, [result[0].kami, getClientIP(req), login.userName, result[0].agent], function (err, result2) {});
                        res.json({success: '更新成功'});
                        conn.release(); 
                    });
                } else {
                    res.json({error: '无效卡密'});
                    conn.release();
                }
            });
        });
    } else {
        res.json({error: '请重新登入'});
    }
});
router.post('/addKami', function (req, res) {
    var login = req.session.loginUser;
    var addNum = Number(req.body.addNum) || 1;
    var day = req.body.day;
    var agent = req.body.agent;
    var createTime = new Date().getTime();
    var userList = ['ashunadmin', 'ahaoadmin'];
    if(login && userList.indexOf(login.userName) > -1) {
        var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        // 随机产生
        var info = [];
        for (var j = 0; j < addNum; j++) {
            var range = Math.round(Math.random() * 5) + 32;
            var str = '';
            for(var i=0; i<range; i++){
                pos = Math.round(Math.random() * (arr.length-1));
                str += arr[pos];
            }
            info.push([encryption.md5(createTime+j+'ahaoadmin'+str)+arr[range], day, agent, createTime]);
        }
        var sqlInfo = "INSERT INTO kami(kami,day,agent,createTime) VALUES ?";
        poolUser.getConnection(function (err, conn) {
            if (err) console.log("POOL register==> " + err);
            conn.query(sqlInfo, [info], function (err, result) {
                if (err) {
                    console.log('sqlInfo - ', err.message);
                    res.json({error: '系统出错请重新操作'});
                } else {
                    res.json({list: info});
                }
                conn.release();
            });
        });
    } else {
        res.json({error: '身份错误'});
    }
});

router.post('/register', function (req, res) {
    var recommend =  req.body.recommend;
    var userName = req.body.userName? req.body.userName.replace(/\s+/g, "") : '';
    var err = vaidParams(userName, req.body.password);
    var sql = 'SELECT * FROM list where userName = "'+ userName + '"';
    var sql2 = "INSERT INTO list(userName, password, total, type, rgTime) VALUES (?, ?, ?, ?, ?)";
    if (err) {
        res.json({error: err});
        return;
    }
    poolUser.getConnection(function (err, conn) {
        if (err) console.log("POOL register==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('register - ', err.message);
                res.json({error: '系统出错请重新操作'});
                conn.release();
            } else {
                if (!result[0]) {
                    conn.query(sql2, [userName, req.body.password, '0', req.headers['host'], new Date().getTime()+''], function (err1, result1) {
                        if (err1) {
                            console.log('register1- ', err1.message);
                            res.json({error: '系统出错请重新操作2'});
                        }  else {
                            req.session.loginUser = {userName: userName};
                            res.json({userName: userName});
                        }
                        if (recommend) {
                            setRecommend(req, recommend, 2);
                        }
                        conn.release();
                    });
                } else {
                    res.json({error: '用户已存在'});
                    conn.release();
                }
            }
        });
    });
});

router.post('/login', function (req, res, next) {
    // 获取所有列表
    var userName = req.body.userName? req.body.userName.replace(/(^\s*)|(\s*$)/g, "") : '';
    var err = vaidParams(userName, req.body.password);
    var sql = 'SELECT * FROM list where userName = "'+ userName + '"';
    if (err) {
        res.json({error: err});
        return;
    }
    poolUser.getConnection(function (err, conn) {
        if (err) console.log("POOL login==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                console.log('login--', err.message);
                res.json({error: '系统出错请重新操作'});
            } else {
                if (result.length) {
                    if (req.body.password === result[0].password) {
                        delete result[0].password;
                        req.session.loginUser = result[0];
                        res.json(result[0]);
                    } else {
                        res.json({error: '用户或密码不正确'});
                    }
                } else {
                    res.json({error: '用户不存在'});
                }
            }
            conn.release();
        });
    });
});

// 退出登录
router.post('/logout', function (req, res, next) {
    req.session.loginUser = null;
    res.clearCookie('testapp');
    res.json({success:'退出成功'});
});

// 下载
router.post('/downLadIntegral', function (req, res) {
    var recommend =  req.body.recommend;
    if (recommend) {
        setRecommend(req, recommend, 1);
    }
    res.json({success:'成功'});
})

// 重新查询登录
router.post('/refreshLogin', function (req, res, next) {
    var user = req.session.loginUser;
    if (user && user.userName) {
        var sql = 'SELECT * FROM list where userName = "'+ user.userName + '"';
        poolUser.getConnection(function (err, conn) {
            if (err) console.log("POOL refresh-register==> " + err);
            conn.query(sql, function (err, result) {
                if (result.length) {
                    delete result[0].password;
                    req.session.loginUser = result[0];
                }
                res.json({success: '结束'});
                conn.release();
            });
        });
    } else {
        res.json({error: ''});
    }
});

// 更新用户列表
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
router.post('/exchange', function (req, res, next) {
    var login = req.session.loginUser;
    if (login.userName && login.integral) {
        var integral = Number(login.integral) + 1;
        var endTime = new Date().getTime();
        if (login.endDate) {
            if (new Date(login.endDate).getTime() > endTime) {
                endTime = new Date(login.endDate).getTime();
            }
        }
        var endDate = getFormatDate(endTime + (integral * 24 * 60 * 60 * 1000));
        var sql = 'update list set integral = "", endDate = "'+ endDate +'" where userName = "'+ login.userName + '"';
        poolUser.getConnection(function (err, conn) {
            if (err) console.log("POOL userlist-register==> " + err);
            conn.query(sql, function (err, result) {
                login.integral = 0;
                login.endDate = endDate;
                res.json({success: '更新成功'});
                conn.release();
            });
        });
    } else {
        res.json({error: '更新失败'});
    }
});

router.get('/video/list/:id', function(req, res) {
    let path = './public/videos/'+req.param.id;
    let stat = '';
	try{
        stat = fs.statSync(path);
    }catch(e){
        res.end()
		return;
    }
    let fileSize = stat.size;
    let range = req.headers.range;
    if (range) {
        //有range头才使用206状态码

        let parts = range.replace(/bytes=/, "").split("-");
        let start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : start + 999999;

        // end 在最后取值为 fileSize - 1 
        end = end > fileSize - 1 ? fileSize - 1 : end;
        console.log(start, end);
        let chunksize = (end - start) + 1;
        let file = fs.createReadStream(path, { start, end });
        let head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        let head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(path).pipe(res);
    }
})

router.get('*', function (req, res, next) {
    var listObj = {
        pageTitle: '茄子404页面',
        pageKeyword: '茄子,茄子图片,动漫茄子,茄子酱',
        pageDescrition: '茄子有你,茄子吧给你想要哦',
        host: 'http://'+req.headers['host']
    }
    res.status(404);
    res.render('404', listObj);
});

module.exports = router;