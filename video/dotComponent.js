// 视频打点组件
var dotComponent = Aliplayer.Component({
  init: function (adAddress, toAddress) {
    this.adAddress = adAddress;
    this.toAddress = toAddress;
    this.dialog = document.getElementById('dialog');
    this.close = document.getElementById('close');
  },
  createEl: function (el) {
    var that = this;
    this.close.onclick = function () {
      that.dialog.style.display = 'none';
      that.player.play();
    }
  },
  // 开始播放
  play: function (player, e) {
    this.player = player
    this.dialog.style.display = 'none';
  },  // 正在播放
  playing: function (player, e) {
    player.on('timeupdate', function (e) {
      var num = player.getCurrentTime();
      //
      if (Math.floor(num) === count) {
        count += 10
        player.pause();
        this.dialog.style.display = 'block';
      }
    })
    console.log(e);
  }
});