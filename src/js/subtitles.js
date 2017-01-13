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