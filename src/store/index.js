import { createStore, combineReducers, applyMiddleware,compose } from "redux"
import createSagaMiddleware from "redux-saga"
import * as effects from "redux-saga/effects"

const NAMESPACE_SEPERATOR = '/'

// 1. dva首先是一个函数，执行dva函数获取app实例
// eslint-disable-next-line import/no-anonymous-default-export
export default function () {
    // 创建dva导出的app对象
    let app = {
        model,
        _models: {},
        start
    }
    function model () {
        // 调用model方法时直接将model存放起来

        const allModulesFiles = require.context('../',true, /\.js$/)
        allModulesFiles.keys().forEach(modulePath=>{
            
             
            const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
            if(moduleName.match('models')){
                const file = allModulesFiles(modulePath)
                const nameArr = moduleName.split(NAMESPACE_SEPERATOR)
                if(app._models[nameArr[0]]){
                    app._models[nameArr[0]].push(file.default)
                }else{
                    app._models[nameArr[0]] = [file.default]
                }
              
            }
        })
 
    
    }
    
    // 启动应用进行渲染
    function start () {
          
        // 将model中得数据进行合并为reducers
        let reducers = {};
        Object.keys(app._models).forEach(item => {
            for (let model of app._models[item]) {
                reducers[item + model.namespace] = function (state = model.state, action) { 
                    let actionType = action.type; // 获取动作类型
                    let values = actionType.split(NAMESPACE_SEPERATOR);  // 从action中提取出相应得处理方法信息
                    if (values[0] === (item+model.namespace)) {
                        // 检测当前的命名空间是否匹配, 匹配后获取当前要进行计算状态的reducer
                        let reducer = model.reducers[values[1]];
                        if (reducer) {
                            return reducer(state, action)
                        }
                    }
                    return state;
                }
            }
        })
       
        let reducer = combineReducers(reducers); // 合并reducer

        // 利用sage处理异步执行逻辑
        let sagaMiddleware = createSagaMiddleware()
        function* rootSaga () {  // 处理异步逻辑， 将effects中的异步执行放到新的一个进程中执行， 这是saga这个库处理的
            const keys = Object.keys(app._models)
            for(let i = 0;i<keys.length;i++){
                 
                for (const model of app._models[keys[i]]) {
                    for (const key in model.effects) {
                        // 启动一个进程去处理异步动作
                          
                        yield effects.takeEvery(`${keys[i]}${model.namespace}${NAMESPACE_SEPERATOR}${key}`, model.effects[key], effects)
                    }
                }
            }
           
        }
        const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
        // 1. 创建store仓库， 基于redux实现:
        let store = createStore(reducer, composeEnhancers(applyMiddleware(sagaMiddleware)))
        // 启动saga中间件:
        sagaMiddleware.run(rootSaga)
      
        return store
    }
    return app;
}