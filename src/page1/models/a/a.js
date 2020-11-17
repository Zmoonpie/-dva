// eslint-disable-next-line import/no-anonymous-default-export
export default {
    namespace: 'a',
    state: {
        cooperateArr: [1,2,3], //存储 初始化的 操作 权限
    },
    effects: {
        *test (  { call, put },action) {debugger
            console.log(action);
            yield put({ type: "page1a/test1", payload: { testData: 11111 } })
        }
    },
    reducers: {
        test1 (state, action) { debugger
            console.log(state, action);
            return { ...state, ...action.payload }
        }
    }
}