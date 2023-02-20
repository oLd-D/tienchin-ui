<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="活动名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入活动名称"
            clearable
            @keyup.enter="handleQuery"
            style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="渠道来源" prop="channelId">
        <el-select
            v-model="form.channelId"
            placeholder="请选择渠道"
            clearable
            style="width: 150px"
        >
          <el-option
              v-for="channel in channelList "
              :key="channel.channelId"
              :label="channel.channelName"
              :value="channel.channelId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择活动状态" clearable style="width: 100px">
          <el-option
              v-for="dict in activity_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择活动类型" clearable style="width: 100px">
          <el-option
              v-for="dict in activity_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['tienchin:activity:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['tienchin:activity:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['tienchin:activity:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['tienchin:activity:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="活动编号" align="center" :show-overflow-tooltip="true" width="080" prop="activityId"/>
      <el-table-column label="活动名称" align="center" :show-overflow-tooltip="true" width="100" prop="name"/>
      <el-table-column label="渠道名称" align="center" :show-overflow-tooltip="true" width="100" prop="channelName"/>
      <el-table-column label="活动简介" align="center" :show-overflow-tooltip="true" width="150" prop="info"/>
      <el-table-column label="活动类型" align="center" width="80">
        <template #default="scope">
          <dict-tag :options="activity_type" :value="scope.row.type"/>
        </template>
      </el-table-column>
      <el-table-column label="活动明细" align="center" :show-overflow-tooltip="true" width="120">
        <template #default="scope">
          <div v-if="scope.row.type==1">
            折扣券/{{ scope.row.discount }}折
          </div>
          <div v-else>
            代金券/{{ scope.row.voucher }}折
          </div>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" width="80">
        <template #default="scope">
          <dict-tag :options="activity_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="活动开始时间" align="center" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.beginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动结束时间" align="center" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                     v-hasPermi="['tienchin:activity:edit']">
            修改
          </el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                     v-hasPermi="['tienchin:activity:remove']">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="activityRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="渠道来源" prop="channelId">
              <el-select
                  v-model="form.channelId"
                  placeholder="请选择渠道来源"
                  clearable
                  style="width: 240px"
              >
                <el-option
                    v-for="channel in channelList "
                    :key="channel.channelId"
                    :label="channel.channelName"
                    :value="channel.channelId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入活动名称"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="创建时间" style="width: 100%" prop="activityTime">
          <el-date-picker
              v-model="form.activityTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="活动简介" prop="info">
              <el-input v-model="form.info" placeholder="请输入活动简介"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="活动类型" prop="type">
              <el-select
                  v-model="form.type"
                  placeholder="请选择活动类型"
                  clearable
              >
                <el-option
                    v-for="dict in activity_type "
                    :key="dict.value"
                    :label="dict.label"
                    :value="parseInt(dict.value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="18">
            <el-form-item label="折扣券" prop="discount" v-if="form.type==1">
              <el-input-number style="width: 100%" v-model="form.discount" :precision="2"
                               :step="0.1" :min="0" :max="10" placeholder="请输入折扣大小"/>
            </el-form-item>
            <el-form-item label="代金券" prop="voucher" v-if="form.type==2">
              <el-input-number style="width: 100%" v-model="form.voucher" :precision="2"
                               :step="100" :min="0" placeholder="请输入代金券金额"/>
            </el-form-item>
          </el-col>
        </el-row>
<!--        <el-form-item label="备注" prop="remark">-->
<!--          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"/>-->
<!--        </el-form-item>-->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Post">
import {listPost, addPost, delPost, getPost, updatePost} from "@/api/system/post";
import {
  addActivity,
  delActivity,
  getActivity,
  listActivity,
  listChannel,
  updateActivity
} from "../../../api/tienchin/activity";

const {proxy} = getCurrentInstance();
const {
  sys_normal_disable,
  activity_type,
  activity_status
} = proxy.useDict("sys_normal_disable", "activity_type", "activity_status");

const activityList = ref([]);
const channelList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    channelId: undefined,
    type: undefined,
    status: undefined
  },
  rules: {
    channelId: [{required: true, message: "渠道来源不能为空", trigger: "blur"}],
    name: [{required: true, message: "渠道名称不能为空", trigger: "blur"}],
    activityTime: [{required: true, message: "活动时间不能为空", trigger: "blur"}],
    info: [{required: true, message: "活动简介不能为空", trigger: "blur"}],
    type: [{required: true, message: "活动类型不能为空", trigger: "blur"}],
    discount: [{required: true, message: "折扣券不能为空", trigger: "blur"}],
    voucher: [{required: true, message: "代金券不能为空", trigger: "blur"}],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询活动列表 */
function getList() {
  loading.value = true;
  listActivity(queryParams.value).then(response => {
    activityList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 查询渠道信息 */
function handleGetChannel() {
  listChannel().then(resp => {
    channelList.value = resp.data
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    channelId: undefined,
    name: undefined,
    activityTime: undefined,
    info: undefined,
    type: undefined,
    discount: undefined,
    voucher: undefined,
    remark: undefined
  };
  proxy.resetForm("activityRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  handleGetChannel();
  open.value = true;
  title.value = "添加活动";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  handleGetChannel();
  const activityId = row.activityId || ids.value;
  getActivity(activityId).then(response => {
    form.value = response.data;
    form.value.activityTime = new Array();
    form.value.activityTime.push(response.data.beginTime)
    form.value.activityTime.push(response.data.endTime)
    open.value = true;
    title.value = "修改活动";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["activityRef"].validate(valid => {
    if (valid) {
      if (form.value.activityId != undefined) {
        // 拆分开始时间和结束时间
        form.value.beginTime = form.value.activityTime[0];
        form.value.endTime = form.value.activityTime[1];
        updateActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.beginTime = form.value.activityTime[0];
        form.value.endTime = form.value.activityTime[1];
        delete form.value.updateTime
        delete form.value.createTime
        addActivity(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const activityIds = row.activityId || ids.value;
  proxy.$modal.confirm('是否确认删除活动编号为"' + activityIds + '"的数据项？').then(function () {
    return delActivity(activityIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("tienchin/activity/export", {
    ...queryParams.value
  }, `activity_${new Date().getTime()}.xlsx`);
}

handleGetChannel();
getList();
</script>
