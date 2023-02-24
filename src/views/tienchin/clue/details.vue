<template>
  <div>线索详情</div>
  <el-input v-model="name"></el-input>
</template>

<script setup name="Post">
import {getCurrentInstance, onMounted} from "vue";

const {proxy} = getCurrentInstance();
const data = reactive({
  name: 'zhangsan'
});

const {name} = toRefs(data)
/**
 * 跳转到此页面的url为: /clue/details/index/10/view
 */
onMounted(() => {
  const clueId = proxy.$route.params && proxy.$route.clueId;
  const type = proxy.$route.params && proxy.$route.type;
  console.log(clueId)
  console.log(type)
})
</script>
