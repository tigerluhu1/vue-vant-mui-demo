// 移动端 300 毫秒点击事件
if('addEventListener' in document) {
  console.log('处理300毫秒延迟')
  document.addEventListener('DOMContentLoaded', function() {
    FastClick.attach(document.body);
  }, false);
}

axios.defaults.baseURL = Config.restUrl
axios.defaults.timeout = 30 * 1000

		// mui 操作，需要设置 mui
const app = {
	// 设置系统状态栏
	_setStatusBar() {
		plus.navigator.setStatusBarStyle('dark');
		plus.navigator.setStatusBarBackground('light');
	},
	_setStatusBarPaddingTop() {
		// 取得 状态的高度，然后设置到 app 实例上
		let vm = document.getElementById('app');
		let statusBarHeight = plus.navigator.getStatusbarHeight();
		vm.style.paddingTop = statusBarHeight + 'px'
	},
	// 页面跳转
	push(url, extras = {}) {
		mui.openWindow({
			url,
			id: url,
			preload: true,
			show: {
				aniShow: 'pop-in'
			},
			styles: {
				popGesture: 'hide'
			},
			waiting: {
				autoShow: false
			},
			extras
		});
	},
  moveTaskToBack () {
    // app 最小化
    mui.back = () => {
      let main = plus.android.runtimeMainActivity();
      main.moveTaskToBack(false);
    }
  },
	init() {
		app._setStatusBar();
		app._setStatusBarPaddingTop();
	}
}
// 公共函数
const common = {
  // hbuilder 不能输入对象数组什么的，这里需要自己处理下，还不够完善
	log(content) {
		if(typeof content === 'object') {
			console.log(JSON.stringify(content, null, 4));
		} else {
			console.log(content);
		}
	}
}

// http 请求 需要引入 axios.min.js
const http = {
	request(options) {
		return new Promise((resolve, reject) => {
			// 创建实例
			const instance = axios.create({
				headers: {
					'token': localStorage.getItem('token') // 设置header 默认值，根据自己情况而定
				}
			})
			// 请求成功时处理
			instance.interceptors.response.use(res => {
				return res
			}, err => {
        // 1、绕过拦截器，完全自己处理
        if (options.handle === true) {
          return Promise.reject(err)
        }

        // 如果返回的是自己网站的错误应该是有这个data的
        if (err.response.data) {
          // 2、特殊异常，当检测到时采取对应的操作，例如这个表示一定要先登录才可以使用
          if (err.response.data.error_code === 10003) {
            // 需要重新登录
            vm.$dialog.alert({
							message: '身份已过期，需要重新登录'
            }).then(() => {
            	app.push('login.html')
            })
            return Promise.reject(err)
          }
          // 3、普通异常，比如参数错误或者其他，直接弹出错误就可以的
          // // 这里可以用一个弹出提示
          vm.$dialog.alert({
            message: err.response.data.msg
          })
        }
				return err
			})
			// 发送请求
			instance.request(options)
				.then(res => {
					return resolve(res.data)
				})
				.catch(err => {
					return reject(err)
				})
		})
	},
	post(options) {
		options.method = 'post'
		return new Promise((resolve, reject) => {
			http.request(options).then(resolve).catch(reject)
		})
	}
}

Vue.prototype.$request = http.request;
Vue.prototype.$post = http.post;
Vue.prototype.$app = app;
Vue.prototype.$mui = mui;
