const Koa = require('koa');
const static = require('koa-static');
var Router = require('koa-router');
const converter = require("node-m3u8-to-mp4");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var http = require('http');
const app = new Koa();
var router = new Router();

router.get('/run', async(ctx, next) => {
   var {name, url} = ctx.request.query;
  console.info('name: ' + name + ' url: ' + url);
  var msg = await toMp4(name, url);
  ctx.body = {
	  message: msg
  }
});
router.get('/getM3u8Link', async(ctx, next) => {
   var {url} = ctx.request.query;
  var msg = await startRequest(url);
  ctx.body = {
	  message: msg
  }
});
app
  .use(router.routes())
  .use(router.allowedMethods());
// 配置静态web服务的中间件
app.use(static('html'));
app.listen(3000,function(){
    console.log('启动成功');
});
app.on('error', (err, ctx) =>{
	  console.error('server error', err);
	}
  
);
function toMp4(name, m3u8Url){
	return new Promise((resolve, reject) => {
	  var fileName = 'mp4/'+ name + ".mp4";
	  converter(m3u8Url,fileName).then(() => {
		  resolve('解析完成');
	  });
	});
}

function startRequest(url) {
	return new Promise((resolve, reject) => {
		//采用http模块向服务器发起一次get请求      
    http.get(url, function(res) { //get到x网址，成功执行回调函数
        var html = ''; //用来存储请求网页的整个html内容
        //res.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        res.on('data', function(chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function() {
            console.info(html);
			const dom = new JSDOM(html);
			const iframe = dom.window.document.body.getElementsByTagName('iframe');
			console.info(iframe);
			resolve(iframe && iframe.length > 0 ? iframe[0].src : '');
        });

    }).on('error', function(err) { //http模块的on data,on end ,on error事件
        console.log(err);
		reject(err);
    });

	});
    
}
