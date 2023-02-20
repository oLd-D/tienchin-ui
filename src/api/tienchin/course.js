import request from '@/utils/request'

// 查询活动列表
export function listCourse(query) {
    return request({
        url: '/tienchin/course/list',
        method: 'get',
        params: query
    })
}


// 查询活动详细
export function getCourse(courseId) {
    return request({
        url: '/tienchin/course/' + courseId,
        method: 'get'
    })
}

// 新增活动
export function addCourse(data) {
    return request({
        url: '/tienchin/course',
        method: 'post',
        data: data
    })
}

// 修改活动
export function updateCourse(data) {
    return request({
        url: '/tienchin/course',
        method: 'put',
        data: data
    })
}


// 删除活动
export function delCourse(courseIds) {
    return request({
        url: '/tienchin/course/' + courseIds,
        method: 'delete'
    })
}


