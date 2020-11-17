import { connect } from 'react-redux';
import React, { useState, useEffect, useRef, useCallback } from 'react';

const wrap = Wr  =>{
     
    return  (props)=>{ 
        return <Wr {...props}></Wr>
    }
}

function Index (props) { 
    const { con } = props
    return (
        <div>
            {props.count}
            <button onClick={() => con()}> 按我</button>
        </div>
    )
}

// 映射Redux全局的state到组件的props上
const mapStateToProps = (state) => ({
    count: state.pagea.count,

});
// 映射dispatch到props上
const mapDispatchToProps = (dispatch) => {
    return {
        con () {
            dispatch({ type: 'pagea/test', playload: 1 })
    }
}
  };

export default connect(mapStateToProps, mapDispatchToProps)(wrap(React.memo(Index)));