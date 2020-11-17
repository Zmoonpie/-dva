// eslint-disable-next-line import/no-anonymous-default-export
export default {
    namespace: 'a',
    state: {
        cooperateArr: [1,2,3], //存储 初始化的 操作 权限
        count:0
    },
    effects: {
        *test ( { call, put },action, ) { 
            console.log(action);
            yield put({ type: 'pagea/test1', payload: { testData: 11111 } })
        }
    },
    reducers: {
        test1 (state, action) {  
            console.log(state, action);
            const count = state.count+1
            return { ...state, count }
        }
    }
}