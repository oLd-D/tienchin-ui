import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/auth-redirect', '/bind', '/register'];

/**
 * 路由前置导航守卫
 * 在 Vue 中的所有页面跳转，都会被这个全局的前置导航守卫监听到，这个类似于 Java 中的 Filter
 * to：要去哪，去哪个页面：类似于 HttpServletResponse
 * from：从哪来，从哪个页面来，类似于 HttpServletRequest
 * next：一个继续向下执行的函数，类似于 FilterChain
 */
router.beforeEach((to, from, next) => {
  NProgress.start()
  // 从 Cookie 中获取用户之前登陆后从后端返回的 token, 取得到说明用户已登陆/登陆未过期
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    // 如果已经登录了, 但是此时还想要跳转到登录页面, 这个操作是不被允许的, 此时就会跳转回到项目首页
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 去的不是登录页面, 则为普通页面:
      // 若 useUserStore().roles.length === 0, 则
      // - 要么是用户刚登录, 还未去服务端请求用户信息(和动态菜单信息)
      // - 要么是用户点击了浏览器刷新按钮, 用户信息和动态菜单信息也会被清空
      // 无论哪种都需要加载/重新加载相应信息, 且可以以此作为监控动态菜单信息是否存在
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        // 加载用户基本信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          //加载路由信息
          usePermissionStore().generateRoutes().then(accessRoutes => {
            // 根据roles权限生成可访问的路由表
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                router.addRoute(route) // 动态添加可访问路由表
              }
            })
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        // 说明就是普普通通的页面跳转
        next()
      }
    }
  } else {
    // 没有 token，没有登录
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      // 否则说明你在未登录的情况下，想要跳转到一个需要登录成功后才能访问的页面，此时就统一重定向到登录页面
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})