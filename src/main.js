// 导入必要的库和组件
import { createApp } from "vue"; //导入vue
import ElementPlus from "element-plus"; //导入element-plus
import "element-plus/dist/index.css"; //导入element-plus的样式
import router from "@/router"; // 导入路由配置
import App from "./App.vue"; // 导入根组件（App.vue）
import { createPinia } from "pinia"; // 导入Pinia用于状态管理
import { createPersistedState } from "pinia-persistedstate-plugin"; // 导入Pinia插件用于状态持久化
import locale from "element-plus/dist/locale/zh-cn.js"; // 导入Element Plus的中文语言包
// 导入主要的样式文件
import "./assets/main.scss";

// 创建Vue应用实例
const app = createApp(App);

// 创建Pinia状态管理实例
const pinia = createPinia();

// 创建持久化状态使用的Pinia插件
const persist = createPersistedState();
pinia.use(persist);

// 在Vue应用实例中使用Pinia
app.use(pinia);

// 在Vue应用实例中使用路由配置
app.use(router);

// 在Vue应用实例中使用Element Plus，并使用中文语言包
app.use(ElementPlus, { locale });

// 将Vue应用挂载到指定的HTML元素上
app.mount("#app");
