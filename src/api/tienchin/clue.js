import request from '@/utils/request'

// 查询活动列表
export function listChannels(query) {
    return request({
        url: '/tienchin/clue/channels',
        method: 'get',
        params: query
    })
}
// 查询线索列表
export function listClue() {
    return request({
        url: '/tienchin/clue/list',
        method: 'get',
    })
}
// 查询活动列表
export function listActivity(channelId) {
    return request({
        url: '/tienchin/clue/activity/' +channelId,
        method: 'get'
    })
}

// 查询活动详细
export function getClue(clueId) {
    return request({
        url: '/tienchin/clue/' + clueId,
        method: 'get'
    })
}

// 新增活动
export function addClue(data) {
    return request({
        url: '/tienchin/clue',
        method: 'post',
        data: data
    })
}

// 修改活动
export function updateClue(data) {
    return request({
        url: '/tienchin/clue',
        method: 'put',
        data: data
    })
}


// 删除活动
export function delClue(clueIds) {
    return request({
        url: '/tienchin/clue/' + clueIds,
        method: 'delete'
    })
}


