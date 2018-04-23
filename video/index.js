//默认参数
var defaultParameter = {
	autoplay: true,//播放器是否自动播放，在移动端autoplay属性会失效 Safari11不会自动开启自动播放
	isLive: false,//播放内容是否为直播，直播时会禁止用户拖动进度条
	playsinline: true,//H5是否内置播放，有的Android浏览器不起作用
	controlBarVisibility: 'always',//控制控制面板的显示，默认为‘click’，可选的值为：‘click’、‘hover’、‘always’
	useH5Prism: false,//指定使用H5播放器
	useFlashPrism: true,//指定使用Flash播放器
	cover: "",//播放器默认封面图片，请填写正确的图片url地址
	components: [],
  x5_type:'h5',
  size:['100%','300px'],
  playsinline:true
}
var videoParameter;
var isHLS = false;
var videoPlayer = {//视频播放器对象
  time:3
};
var mergingMethod = {
  play: function(_call){
    if(isHLS){
      window.player.onResume(function(){
        _call();
      })
    } else{
      window.player.on("play", function(){
        _call();
      })
    }
  },
  paused: function(_call){
    if(isHLS){
      window.player.onPause(function(){
        _call();
      })
    } else{
      window.player.on("pause", function(){
        _call();
      })
    }
  },
  ended: function(_call){
    if(isHLS){
       window.player.onFinish(function(){
        _call();
      })
    } else{
      window.player.on("ended", function(){
        _call();
      })
    }
  },
  seek: function(_call){
    if(isHLS){
      window.player.onSeek(function(){
        var time = Math.floor(window.player.getTime());
        window.player.seekTo(time);
      })
    } else{
      window.player.on("completeSeek", function(){
        var paramData = Math.floor(window.player.getCurrentTime());
        window.player.seek(paramData);
      })
    }
  },
  loadByUrl: function(newUrl){
    if(isHLS){
     var hlsPlayer = flowplayer(videoParameter.id, "flowplayer.swf", {
        plugins: {
          httpstreaming: {
            url: 'flashlsFlowPlayer.swf'
          }
        },
        clip: {
          url: newUrl,
          ipadUrl: newUrl,
          urlResolvers: ["httpstreaming","brselect"],
          provider: "httpstreaming",
          autoPlay: true
        },
        log: {
          level: 'debug',
          filter: 'org.osmf.*, org.electroteque.m3u8.*, org.flowplayer.bitrateselect.*'
        }
      }).ipad();
    } else{
      window.player.loadByUrl(newUrl);
    }
  }
}
//判断浏览器终端
var browser = {
  versions: function () {
      var u = navigator.userAgent, app = navigator.appVersion;
      return {
          trident: u.indexOf('Trident') > -1, //IE内核
          presto: u.indexOf('Presto') > -1, //opera内核
          webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
          gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
          mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
          ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
          android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
          iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
          iPad: u.indexOf('iPad') > -1, //是否iPad
          webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
          weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
          qq: u.match(/\sQQ/i) == " qq" //是否QQ
      };
  }(),
  language: (navigator.browserLanguage || navigator.language).toLowerCase()
}

// 动态创建翻译字幕
function newTrack(tag, obj) {
    var newTrack = document.createElement('track');
    newTrack.kind = obj.kind || 'subtitles';
    newTrack.src = obj.src;
    newTrack.srclang = obj.srclang || 'zh';
    newTrack.label = obj.label || 'Chinese';
    tag.appendChild(newTrack);
}

// 视频打点组件
function dotComponent(videoParameter) {
  var data = videoParameter.dotPrompt.dotPromptData
  return Aliplayer.Component({
    init: function () {
      this.progress = document.querySelector('.prism-progress')
      this.myVideo = document.getElementById(videoParameter.id)//待更改
    },
    // 创建组件的UI
    createEl: function (el) {},
    // 视频可播放状态
    ready: function(player){
      var that = this;
      this.total = player.getDuration();
      createDialog (this.myVideo,videoParameter)
      for(var i=0;i<data.length;i++){
        createSpot(this.progress, this.total, data[i].time)
        createText(this.progress, data[i].text, this.total, data[i].time)
      }
    },
    // 开始播放
    play: function (player, e) {
    	if (document.getElementById('textDialog')) document.getElementById('textDialog').style.display = 'none';
    },
    // 正在播放
    playing: function (player, e) {
      this.player = player;
    },
    // 播放事件改变
    timeupdate: function (player, e) {
      var num = player.getCurrentTime();
      setTimeout(function(){
        for(var i=0;i<data.length;i++){
          if (Math.floor(num) === data[i].time) {
            player.pause();
            document.getElementById('textDialog').innerHTML = data[i].overlayText
            document.getElementById('textDialog').style.display = 'block';
          }
        }
      },1000)
    }
  });
}
// 创建dialog框
function createDialog (parent,videoParameter){
  var newDialog = document.createElement('div');
  newDialog.id = 'textDialog';
  newDialog.style.width = '100%';
  newDialog.style.height = videoParameter.size ? videoParameter.size[1] : '300px';
  parent.appendChild(newDialog);
}
// 视频白点
function createSpot(bar, total, pos){
  var newSpot = document.createElement('div');
  newSpot.className = 'prism-progress-spot';
  newSpot.style.right = 'auto';
  newSpot.style.left = pos/(total/100)+1+'%';
  bar.appendChild(newSpot);
}
// 视频白点提示文本
function createText(bar, text, total, pos){
  var newtext = document.createElement('div');
  newtext.innerHTML = text;
  newtext.className = 'prism-progress-text';
  newtext.style.right = 'auto';
  newtext.style.left = pos/(total/100)+1+'%';
  bar.appendChild(newtext);
}
//判断播放器类型
function checkPlayerType(){
  var player = document.getElementById(videoParameter.id).getElementsByTagName('video');
  if(player.length){
    return 'H5'
  }else{
    return 'flash'
  }
}
//播放进度监控（flash）
function playProgressMonitor(){
  var timer = setInterval(function(){
    var dotPrompt_data = videoParameter.dotPrompt.dotPromptData;
    if(player.getCurrentTime){
      var player_curTime = Math.floor(player.getCurrentTime())
    }else{
      var player_curTime = Math.floor(player.getTime());
    }
    for (var i =0;i<dotPrompt_data.length;i++) {
      var difference = dotPrompt_data[i].time - player_curTime;
      if(dotPrompt_data[i].time == player_curTime){
        $('#J_prismPlayer .vplayer_layer').remove();
        videoPlayer.time = 3;
        player.pause();
        clearInterval(timer);
        var player_video = document.getElementById(videoParameter.id);
        createDialog (player_video,videoParameter);
        document.getElementById('textDialog').innerHTML = dotPrompt_data[i].overlayText
        document.getElementById('textDialog').style.display = 'block';
      }else if(difference == videoPlayer.time){
        var countDownNum = (videoPlayer.time--);
        $('#J_prismPlayer .vplayer_layer').remove();
        $('#J_prismPlayer').append('<div class="vplayer_layer"></div>')
        if(countDownNum != 0){
          $('#J_prismPlayer .vplayer_layer').html(countDownNum+'秒后会有闯关练习!');
        }
      }
    }
  },1000)
}
//h5播放器水印方位
function waterMarkPosition(waterMarkPositionStr){
  var positionA = waterMarkPositionStr.slice(0,1);
  var positionB = waterMarkPositionStr.slice(-1);
  var verticalStr = '';
  var horizontalStr = '';
  if(positionA == 'T'){
    verticalStr = 'top:0;'
  }else if(positionA == 'B'){
    verticalStr = 'bottom:0;'
  }
  if(positionB == 'R'){
    horizontalStr = 'right:0;'
  }else if(positionB == 'L'){
    horizontalStr = 'left:0;'
  }
  return (verticalStr + horizontalStr);
}
//检测IE浏览器
function IEVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器  
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器  
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if(isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if(fIEVersion == 7) {
            return 7;
        } else if(fIEVersion == 8) {
            return 8;
        } else if(fIEVersion == 9) {
            return 9;
        } else if(fIEVersion == 10) {
            return 10;
        } else {
            return 6;//IE版本<=7
        }   
    } else if(isEdge) {
        return 'edge';//edge
    } else if(isIE11) {
        return 11; //IE11  
    }else{
        return -1;//不是ie浏览器
    }
}

//ready事件
function playerReady(player,_callbank){
  player.on('ready',function(e) {
    var that = this;
    //禁止拖拽
    if(!videoParameter.isDrag){
      $('#'+videoParameter.id+' .prism-progress').hide();
    }
    if(checkPlayerType() == 'H5'){//h5播放器
      //字幕
      if(videoParameter.subtitle.show && videoParameter.subtitle.subtitleData.length > 0){
        for (var i = 0; i < videoParameter.subtitle.subtitleData.length; i++) {
            newTrack(player.tag, videoParameter.subtitle.subtitleData[i]);
        }
        player.tag.textTracks[0].mode = 'showing';
      };
      //水印
      if(videoParameter.waterMark && videoParameter.waterMark != ''){
        var waterMarkArr = videoParameter.waterMark.split('|');
        var waterMarkPositionStr = waterMarkPosition(waterMarkArr[1]);
        var height = waterMarkArr[2]?waterMarkArr[2]*100:20;
        var opacity = waterMarkArr[3]?waterMarkArr[3]:1;
        var styles = waterMarkPositionStr + 'height:'+height+'%;opacity:'+opacity;
        $('#'+ videoParameter.id).append('<img src="'+waterMarkArr[0]+'"  style="'+styles+'"/>')
      }
      player.mergingMethod = mergingMethod;
      _callbank(player);
    } else if(checkPlayerType() == 'flash') {//flash播放器
      player.dispose(); //销毁
      $('#'+videoParameter.id).empty();//id为html里指定的播放器的容器id
      HLSPlayer(_callbank);
      return;//由于当前aliplayer无法播放m3u8加密文件，所以隐藏flash播放，使用flowplayer暂替
      if(videoParameter.dotPrompt.show && videoParameter.dotPrompt.dotPromptData && videoParameter.dotPrompt.dotPromptData != ''){
        playProgressMonitor();
        player.on('play',function(){
          document.getElementById('textDialog').innerHTML = ''
          document.getElementById('textDialog').style.display = 'none';
          playProgressMonitor();
        })
      }
    }
    // player.mergingMethod = mergingMethod;
    // _callbank(player);
  })
}
//播放器配置
videoPlayer.player = function(videoParameter,_callbank){
  //打点(h5,播放器生成之前判断不出类型，故无法根据类型判断是否隐藏)
  if(IEVersion() > 8 && videoParameter.dotPrompt.show && videoParameter.dotPrompt.dotPromptData && videoParameter.dotPrompt.dotPromptData != '' && !browser.mobile){
    videoParameter.components = [dotComponent(videoParameter)];
  };
	//尺寸
	if(videoParameter.size){
		videoParameter.width = videoParameter.size[0] ? videoParameter.size[0]:'100%';
		videoParameter.height = videoParameter.size[1] ? videoParameter.size[1]:'300px';
	}
	var player = new Aliplayer(videoParameter);
  player.on('error',function(data){
    player.dispose(); //销毁
    $('#'+videoParameter.id).empty();//id为html里指定的播放器的容器id
    HLSPlayer(_callbank);
  })
  window.player = player;
  playerReady(player,_callbank)
}
//m3u8加密播放
function HLSPlayer(_callbank){
  isHLS = true;
  var hlsPlayer = flowplayer(videoParameter.id, "flowplayer.swf", {
    plugins: {
      httpstreaming: {
        url: 'flashlsFlowPlayer.swf'
      },
      controls: {
        scrubber: videoParameter.isDrag
      }
    },
    clip: {
      url: videoParameter.source,
      ipadUrl: videoParameter.source,
      urlResolvers: ["httpstreaming","brselect"],
      provider: "httpstreaming",
      autoPlay: true
    },
    log: {
      level: 'debug',
      filter: 'org.osmf.*, org.electroteque.m3u8.*, org.flowplayer.bitrateselect.*'
    }
  }).ipad();
  $('#'+videoParameter.id).css({'width':videoParameter.size[0],'height':videoParameter.size[1]});
  console.log(hlsPlayer)
  window.player = hlsPlayer;
  hlsPlayer.mergingMethod = mergingMethod;
  _callbank(hlsPlayer);
  if(videoParameter.dotPrompt.show && videoParameter.dotPrompt.dotPromptData && videoParameter.dotPrompt.dotPromptData != ''){
    playProgressMonitor();
  }
}
var _html = '<div class="update_browser"><img src="../none.png" /><h2>很抱歉！您正在使用的浏览器版本过低，无法正常使用我们的功能，请升级后再试！</h2></div>'
//初始化（参数合并）
videoPlayer.init = function(obj,_callbank){
	videoParameter = $.extend(true,{}, defaultParameter, obj);
  if(IEVersion() <= 8 && IEVersion() > 0){//浏览器版本过低提示
    $('#'+videoParameter.id).html(_html);
  } else if(IEVersion() > 8 && IEVersion() < 11){
    HLSPlayer(_callbank);
  } else{
    isHLS = false;
    //移动端设置autolay=true无效，不会自动播放(手动触发播放按钮事件)
    if(browser.versions.mobile || browser.versions.weixin){
      $('.prism-play-btn').click();
    }
    videoPlayer.player(videoParameter,_callbank);
  }
}
window.videoPlayer = videoPlayer;
