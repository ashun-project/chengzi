var videoObject = {
    container: '#video', //容器的ID或className
    variable: 'player',//播放函数名称
    flashplayer: true,
    poster: '/static/img/ashun.png',//封面图片
    video: document.getElementById('video-url').value
};
var player = new ckplayer(videoObject);
var banner = document.querySelector('.banner');
var img = document.querySelector('.swiper-wrapper .swiper-slide img');
banner.style.height = img.height;
var mySwiper = new Swiper('.swiper-container',{
    loop: true,
    autoplay: 5000,
    pagination : '.swiper-pagination'
});