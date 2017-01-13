var Video = React.createClass({

  play: function() {
    this.refs.video.play();
  },

  pause: function() {
    this.refs.video.pause();
  },

  stop: function() {
    this.pause();
    this.refs.video.currentTime = 0;
  },

  getCurrentTime: function() {
    return this.refs.video.currentTime;
  },

  setCurrentTime: function(time) {
    this.refs.video.currentTime = time;
  },

  getDurationTime: function() {
    return this.refs.video.duration;
  },

  ended: function() {
    return this.refs.video.ended;
  },

  render: function() {
      return (
        <div className="video-container">
          <video ref="video" src="images/intro.mp4" width="320" height="240" controls></video>
          <Controls
            onPlay={this.play}
            onPause={this.pause}
            onStop={this.stop}
            onGetCurrentTime={this.getCurrentTime}
            onGetDurationTime={this.getDurationTime}
            onEnded={this.ended}
            onSetCurrentTime={this.setCurrentTime}
          ></Controls>
         </div>
      )
  }

});

var Controls = React.createClass({

  getInitialState: function(){
      return {
          tempSub: {},
          sub: new Subtitles(),
          playing: false,
          barSize: 320
      }
  },

  play: function() {
    this.props.onPlay();
    this.state.playing = true;

    this.updateBar = setInterval(this.progressBar, 100);

    this.refs.btnPlay.classList.add('el-hide');
    this.refs.btnPause.classList.remove('el-hide');
  },

  pause: function() {
    this.props.onPause();
    this.state.playing = false;

    clearInterval(this.updateBar);

    this.refs.btnPause.classList.add('el-hide');
    this.refs.btnPlay.classList.remove('el-hide');
  },

  stop: function() {
    this.props.onStop();
    this.state.playing = false;

    clearInterval(this.updateBar);

    this.refs.progressDot.style.left = 0;

    this.refs.btnPause.classList.add('el-hide');
    this.refs.btnPlay.classList.remove('el-hide');

    this.refs.currentTime.innerHTML = this.formatTime(parseInt(this.props.onGetCurrentTime()));
  },

  progressBar: function() {

    if (!this.props.onEnded()) {

      this.refs.currentTime.innerHTML = this.formatTime(parseInt(this.props.onGetCurrentTime()));

      let size = parseInt(this.props.onGetCurrentTime()*this.state.barSize/this.props.onGetDurationTime());
      this.refs.progressDot.style.left = size + 'px';


    } else {

      clearInterval(this.updateBar);
      this.refs.btnPause.classList.add('el-hide');
      this.refs.btnPlay.classList.remove('el-hide');
      return;

    }

  },

  formatTime: function(sec) {
    let date = new Date(null);
    date.setSeconds(sec);
    return date.toISOString().substr(14, 5);
  },

  goTo: function(e) {
    let mouseX = e.pageX - this.refs.progressBar.offsetLeft,
        newTime = mouseX * this.props.onGetDurationTime() / this.state.barSize;

    this.props.onSetCurrentTime(newTime);
    this.refs.progressDot.style.left = mouseX + 'px';
  },

  mark: function() {
    let currentTime = this.props.onGetCurrentTime(),
        sub = this.state.tempSub;

    if (sub.start === undefined) {
      sub.start = currentTime;
      if (!this.state.playing) this.play();

    } else {

      sub.end = currentTime;
      this.state.sub = sub;
      this.state.tempSub = {};
      this.pause();
      console.log(this.state.sub);

    }

  },

  render: function() {
      return (
        <div>
          <div className="time">
            <span ref="currentTime">00:00</span> / <span ref="durationTime">{this.props.ct}</span>
          </div>
          <div ref="progressBar" onClick={this.goTo} className="progress-bar">
            <span ref="progressDot" className="progress-dot"></span>
          </div>
          <ul className="video-controls">
            <li ref="btnPlay" className="btn-video fa fa-play" onClick={this.play}></li>
            <li ref="btnPause" className="btn-video fa fa-pause el-hide" onClick={this.pause}></li>
            <li className="btn-video fa fa-stop" onClick={this.stop}></li>
            <li className="btn-video fa fa-arrows-h" onClick={this.mark}></li>
          </ul>
        </div>
      )
  }

});

class Subtitles {
  constructor() {
    this.subtitle = new Array();
  }

  addSub(startTime, endTime, caption) {
    this.subtitle.push({
      'id': this.subtitle.length,
      'start': startTime,
      'end': endTime,
      'caption': caption
    })
  }

  editSub(id, startTime, endTime, caption) {
    let sub = this.getSub(id);
    sub.start = startTime;
    sub.end = endTime;
    sub.caption = caption;
  }

  removeSub(id) {
    this.subtitle.splice(id, 1);
  }

  getSub(id) {
    return this.subtitle[id];
  }
}

ReactDOM.render(<Video/>, document.getElementById('container'));