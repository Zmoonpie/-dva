import React, { useState, useEffect, useRef } from 'react';
import './index.less';
import BaseTable from './BaseTable';

/* 统一方法 */
import { pullRefresh as pull, loadMore as load } from './refresh';

/* transform 做 所有的 滚动 */
/*从父组件传入数据必须满足：
 columns中必须有：
 1、title字段，用来显示表头名称
 2、dataIndex字段，需要根据此字段来显示当前单元格对应的是哪个字段
 3、fixed的 left 必须在 最左边，right的必须在右边，不然会导致遮挡
 4、并且输入的 数据不能导致换行现在没做换行的容错
 */
function Table(props) {
  const [width, setWidth] = useState(0);
  const [leftList, setLeftList] = useState([]);
  const [rightList, setRightList] = useState([]);
  const [leftStyle, setLeftStyle] = useState({});

  /* 存储当前的 滚动实例 */
  const TableRef = useRef(null); // 当前 控制的实例
  const realTableBodyRef = useRef(null); // 页面展示的 真实的 上下滚动的地方

  /* 滚动 */
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [dValue, setDValue] = useState({ x: 0, y: 0 });
  const [base, setBase] = useState({ x: 0, y: 0 });
  // 惯性滚动 加入 动态控制项
  const [inherScroll, setInherScroll] = useState(false);
  /* 存储实际的 table body 的 高度 */
  /*
    containerHeight，
    containerWidth,
    realHeight
  */
  const tableSize = useRef({ containerHeight: 0, containerWidth: 0, realHeight: 0 });
  /* 惯性滚动的数据存储 */
  const inherialScroll = useRef({ startTime: 0, limit: 150, direction: null, pixcel: 100, inOrDe: 1, refresh: null }); // 目前只需要 startTime, 能产生 惯性 滚动的时间

  /* 分页加载 */
  const [loading, setLoading] = useState(false); // 1 标识 下拉 刷新， 2 标识 下拉加载
  /* 滑动 */
  const touchstart = (e) => {
   // e.preventDefault();
    e.stopPropagation();

    /* 判断当前是否在加载 */
    if (loading) return;

    /* 禁止惯性过渡 */
    setInherScroll(false);
    /* 刷新重置 */
    inherialScroll.current.refresh = null;
    inherialScroll.current.startTime = Date.now();
   
    setStart({
      ...start,
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };
  const touchmove = (e) => {
   // e.preventDefault();
    e.stopPropagation();

    /* 判断当前是否在加载 */
    if (loading) return;

    const nextX = e.touches[0].clientX;
    const nextY = e.touches[0].clientY;
 
    const { x: prevX, y: prevY } = start;
    const { x: BX, y: BY } = base;
    let { x: DX, y: DY } = dValue;
    DX = BX + nextX - prevX;
    DY = BY + nextY - prevY;

     console.log(DX, DY);
    /* 同一时刻应该只允许在 一个 方向上 运动 */
    if (Math.abs(nextX - prevX) > Math.abs(nextY - prevY)) {
      // console.log('x运动');
      // x 运动
      /* 这里进行校验 */
      /* 对于 x, y 分别定义 编辑 */
      // x：左右滑动的边界 ，左边界 必须 <= 0; 右边界 必须 Math.abs(table.width - clientWidth)+x >=0, 而且 x 不考虑 做 刷新

      if (DX > 0 || Math.abs(width - tableSize.current.containerWidth) + DX < 0) {
        console.log('不能横向移动了')
        return '不能横向移动了';
      } else {
        inherialScroll.current.direction = 'x';
        inherialScroll.current.inOrDe = nextX - prevX > 0 ? 1 : -1;
        setDValue({
          ...dValue,
          x: DX
        });
        // setStart({
        //   ...start,
        //   x: nextX
        // });
      }
    } else {
      // console.log('y运动');
      // y 运动
      // y：上下滑动的边界，上边界 必须 <= 0; 下边界 必须 Math.abs(table.height - tableHeight) + y >= 0, 这里 要考虑 上拉加载 ，下拉刷新，先不考虑
      if (DY > 50 || Math.abs(tableSize.current.realHeight - tableSize.current.containerHeight) + DY < -50) {
        inherialScroll.current.refresh = DY > 50 ? 1 : 2;
      }
      inherialScroll.current.direction = 'y';
      inherialScroll.current.inOrDe = nextY - prevY > 0 ? 1 : -1;
      setDValue({
        ...dValue,
        y: DY
      });
      // if (DY > 0 || Math.abs(tableSize.current.realHeight - tableSize.current.containerHeight) + DY < 0) {
      //   /* 刷新重置 */
      //   inherialScroll.current.refresh = true;
      //   inherialScroll.current.direction = 'y';
      //   inherialScroll.current.inOrDe = nextY - prevY > 0 ? 1 : -1;
      //   setDValue({
      //     ...dValue,
      //     y: DY
      //   });
      //   // return '不能 竖向 滚动了';
      // } else {
      //   inherialScroll.current.direction = 'y';
      //   inherialScroll.current.inOrDe = nextY - prevY > 0 ? 1 : -1;
      //   setDValue({
      //     ...dValue,
      //     y: DY
      //   });
      // setStart({
      //   ...start,
      //   y: nextY
      // });
      // }
    }
  };
  /* 这里 在做 惯性运动 和 分页 */
  const touchend = (e) => {
   // e.preventDefault();
    e.stopPropagation();

    /* 判断当前是否在加载 */
    if (loading) return;

    const { x, y } = dValue;
    /* 刷新 */
    if (inherialScroll.current.refresh) {
      let back = 0;
      // 开启惯性过渡
      setInherScroll(true);
      if (inherialScroll.current.refresh === 1) {
        back = 0;
        // console.log('出发没')
        pullRefresh();
      }
      if (inherialScroll.current.refresh === 2) {
        back = tableSize.current.containerHeight - tableSize.current.realHeight;
        loadMore();
      }
      setLoading(inherialScroll.current.refresh);
      setDValue({
        ...dValue,
        [inherialScroll.current.direction]: back
      });
      setBase({
        ...base,
        [inherialScroll.current.direction]: back
      });
      return;
    }
    /* 惯性运动
      1、时间 在 一定范围内才做；
    */
    const curTime = Date.now();
    let DT;
    if (
      inherialScroll.current.direction &&
      (DT = curTime - inherialScroll.current.startTime) < inherialScroll.current.limit
    ) {
      const isX = inherialScroll.current.direction === 'x';
      const d = isX ? x : y;
      // console.log(DT);
      const speed = Math.abs(Math.round(d / DT));
      let total = d + inherialScroll.current.inOrDe * speed * inherialScroll.current.pixcel; // 惯性的值
      // console.log(total);
      // 开启惯性过渡
      setInherScroll(true);
      /* 惯性是否到底 还未 判定 */
      if (isX) {
        // x 方向
        if (total > 0) {
          total = 0;
        }
        if (Math.abs(width - tableSize.current.containerWidth) + total < 0) {
          total = tableSize.current.containerWidth - width;
          // console.log(total);
        }
      } else {
        // y方向
        if (total > 0) {
          total = 0;
        }
        if (Math.abs(tableSize.current.realHeight - tableSize.current.containerHeight) + total < 0) {
          total = tableSize.current.containerHeight - tableSize.current.realHeight;
        }
      }
      setDValue({
        ...dValue,
        [inherialScroll.current.direction]: total
      });
      setBase({
        ...base,
        [inherialScroll.current.direction]: total
      });

      inherialScroll.current.startTime = 0;
      inherialScroll.current.direction = null;
    } else {
      // 回复弹性
      if (y > 0) {
        setInherScroll(true);
        setDValue({
          ...dValue,
          y: 0
        });
      }
      if (Math.abs(tableSize.current.realHeight - tableSize.current.containerHeight) + y < 0) {
        setInherScroll(true);
        setDValue({
          ...dValue,
          y: tableSize.current.containerHeight - tableSize.current.realHeight
        });
      }
      let back;
      setBase({
        ...base,
        x,
        y
      });
    }
  };

  /* 分页加载 */
  const pullRefresh = pull(props, setLoading);
  const loadMore = load(props, setLoading);

  /* 采取原生监听，在 react事件系统阻止不了默认事件 */
  useEffect(() => {
    /* 加载更多数据需要 更新 */
    if (tableSize.current.realHeight != parseInt(getComputedStyle(realTableBodyRef.current).height)) {
      tableSize.current.realHeight = parseInt(getComputedStyle(realTableBodyRef.current).height);
    }
    TableRef.current.addEventListener('touchstart', touchstart, { passive: false });
    TableRef.current.addEventListener('touchmove', touchmove, { passive: false });
    TableRef.current.addEventListener('touchend', touchend, { passive: false });

    return () => {
      TableRef.current.removeEventListener('touchstart', touchstart);
      TableRef.current.removeEventListener('touchmove', touchmove);
      TableRef.current.removeEventListener('touchend', touchend);
    };
  }, [start, dValue, base, loading, inherScroll]);

  /* 第一次初始化 */
  useEffect(() => {
    /* 实际 内部 滚动的实际长度 */
    tableSize.current.realHeight = parseInt(getComputedStyle(realTableBodyRef.current).height);
    /* 容器的宽高 */
    tableSize.current.containerHeight = parseInt(getComputedStyle(TableRef.current).height) - 40;
    tableSize.current.containerWidth = parseInt(getComputedStyle(TableRef.current).width);
    const { columns } = props;
    let width = 0;
    let leftList = [];
    let rightList = [];
    const containList = [];
    columns.forEach((item) => {
      if (item.width) {
        width = width + item.width;
      }
      if (item.fixed === 'left') {
        leftList.push(item);
      }
       if (item.fixed === 'right') {
        rightList.push(item);
      }
    });
    const containerWidth = tableSize.current.containerWidth;
    if (containerWidth < width) {
      setWidth(width);
    } else {
      setWidth(containerWidth);
    }
    setLeftList(leftList);
    setRightList(rightList);
  }, []);
  const { className, tableHeight } = props;
  return (
    <div ref={TableRef} className={`${className ? className : ''} table-container`}>
      <div className={'table-scroll'} style={{ height: tableHeight + 'px' }}>
        <BaseTable
         contentWidth={ tableSize.current.containerWidth}
          scrollType="main"
          {...dValue}
          inherScroll={inherScroll}
          loading={loading}
          {...props}
          height={tableHeight}
          width={width}
          realTableBodyRef={realTableBodyRef}
          scrollClassName={'main-scroll'}
        />
      </div>
      <>
        {leftList.length > 0 ? (
          <div className={'left-fixed'} style={leftStyle}>
            <BaseTable
              
              scrollType="left"
              {...dValue}
              inherScroll={inherScroll}
              loading={loading}
              {...props}
              columns={leftList}
              height={tableHeight}
              from={'left'}
              className={'left-table'}
              scrollClassName={'left-scroll'}
            />
          </div>
        ) : null}
        {rightList.length > 0 ? (
          <div className={'right-fixed'}>
            <BaseTable
              scrollType="right"
              {...dValue}
              inherScroll={inherScroll}
              loading={loading}
              {...props}
              columns={rightList}
              height={tableHeight}
              from={'right'}
              className={'right-table'}
            />
          </div>
        ) : null}
      </>
    </div>
  );
}

export default Table;
