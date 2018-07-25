'use strict';

const crypto = require('crypto');
const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'hi, egg';
  }

  async fromWechat() {
    const token = this.ctx.app.config.wechat_config.token;
    const query = this.ctx.query;
    const timestamp = query.timestamp;
    const nonce = query.nonce;
    const signature = query.signature;
    const echostr = query.echostr;
    const str = [ token, timestamp, nonce ].sort().join('');
    const hash = crypto.createHash('sha1');
    hash.update(str);
    const sha = hash.digest('hex');
    if (sha === signature) {
      this.ctx.body = echostr;
    }
  }

  async toWechat() {
    const message = this.ctx.req.body;
    if (message) {
      const MsgType = message.MsgType;
      let reply;
      if (MsgType === 'event') {
        reply = await this.service.home.handleEvent(message);
      } else {
        reply = await this.service.home.handleMsg(message);
      }
      if (reply) {
        const result = await this.service.home.replyMsg(message, reply);
        console.log(result);
        this.ctx.body = result;
        return true;
      }
    }
    this.ctx.body = 'success';
  }
}

module.exports = HomeController;