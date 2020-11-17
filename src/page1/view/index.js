import { connect } from 'react-redux';
import React, { useState, useEffect, useRef, useCallback } from 'react';

function Index (props) {
    const { con } = props
    return (
        <div>
            aaaaaaaaaaaaaaaaaaaaa
            <button onClick={() => con()}> 按我</button>
        </div>
    )
}

// 映射Redux全局的state到组件的props上
const mapStateToProps = (state) => ({
    currentAlbum: state.pageb.cooperateArr,

});
// 映射dispatch到props上
const mapDispatchToProps = (dispatch) => {
    return {
        con () { 
            dispatch({ type: 'page1a/test', playload: 1 })
    }
}
  };

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Index));