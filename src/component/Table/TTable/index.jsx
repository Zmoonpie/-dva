import React, { useState, useEffect, useRef } from 'react';
import '../index.less';
import BaseTable from '../BaseTable';

/* 统一方法 */
import { pullRefresh as pull, loadMore as load } from '../refresh';

import RightTable from './RightTable';
import LeftTable from './LeftTable';

/* transform 做 所有的 滚动 */
/*从父组件传入数据必须满足：
 columns中必须有：
 1、title字段，用来显示表头名称
 2、dataIndex字段，需要根据此字段来显示当前单元格对应的是哪个字段
 3、用 position 来 确定是在 左边 右边 还是 中间
 4、默认 此组件 左边 和 右边的 宽度 是一致的
 5、每一个 都要指定尺寸
 */
function TTable(props) {
  /* 最小 两边的 最小宽度 */
  const [width, setWidth] = useState(0);
  /* 中间的 宽度 */
  const [centerWidth, setCenterWidth] = useState(0);
  /* 两边的剩余 */
  const [sideWidth, setSideWidth] = useState(0);

  const [leftList, setLeftList] = useState([]);
  const [rightList, setRightList] = useState([]);
  const [centerList, setCenterList] = useState([]);

  /* 获取当前的手势 触发区域 */
  // const triggerType = useRef({
  //   now: 0,
  //   prev: 0
  // });
  const [triggerType, setTriggerType] = useState({
    now: 0,
    prev: 0
  }); // 1: left, 2: center, 3: right
  const triggerJSON = {
    'table-side-left': 1,
    'table-center': 2,
    'table-side-right': 3
  };

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
  /* 查找 区域 兼容性 问题 */
  const queryArea = (e) => {
    if (e.path) {
      const classnames = e.path.map((i) => i.className).join('');
      Object.keys(triggerJSON).forEach((json) => {
        if (classnames.match(json)) {
          setTriggerType({
            ...triggerType,
            now: triggerJSON[json]
          });
        }
      });
    } else {
      const getPath = (target) => {
        const reg = /(table-side-left)|(table-center)|(table-side-right)|(table-container)/gi;
        if (reg.test(target.className)) {
          Object.keys(triggerJSON).forEach((json) => {
            if (target.className.match(json)) {
              setTriggerType({
                ...triggerType,
                now: triggerJSON[json]
              });
            }
          });
          return;
        } else {
          getPath(target.parentNode);
        }
      };
      getPath(e.target);
    }
  };
  /* 滑动 */
  const touchstart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    /* 判断当前是否在加载 */
    if (loading) return;

    // console.log(e);
    /* 获取 触发区域 */
    queryArea(e);

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
    e.preventDefault();
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
    // console.log(DX, DY);
    /* 同一时刻应该只允许在 一个 方向上 运动 */
    if (Math.abs(nextX - prevX) > Math.abs(nextY - prevY)) {
      // console.log('x运动');
      // x 运动
      /* 区域图片也不允许 运动 */
      if (triggerType.prev !== 0 && triggerType.now !== triggerType.prev) return;
      /* 匹配到的区域不满足条件不允许运动 */
      if (triggerType.now === 2) return;

      inherialScroll.current.direction = 'x';
      /* 惯性的运动控制 */
      inherialScroll.current.inOrDe = nextX - prevX > 0 ? 1 : -1;
      /* 交互主table有 两个 */
      if (triggerType.now === 3) {
        if (DX > 0 || Math.abs(width - sideWidth) + DX < 0) {
          return '不能横向移动了';
        }
      }
      if (triggerType.now === 1) {
        if (DX < 0 || Math.abs(width - sideWidth) - DX < 0) {
          return '不能横向移动了';
        }
      }

      setDValue({
        ...dValue,
        x: DX
      });
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
    }
  };
  /* 这里 在做 惯性运动 和 分页 */
  const touchend = (e) => {
    e.preventDefault();
    e.stopPropagation();

    /* 判断当前是否在加载 */
    if (loading) return;

    const { x, y } = dValue;
    // console.log('横向移动', x);
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
    /* 区域图片也不允许 运动 */
    if (triggerType.prev !== 0 && triggerType.now !== triggerType.prev) {
      /* 获取触发区域 */
      if (triggerType.now) {
        initSize();
      }
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
      let total;
      total = d + inherialScroll.current.inOrDe * speed * inherialScroll.current.pixcel; // 惯性的值

      // 开启惯性过渡
      setInherScroll(true);
      /* 惯性是否到底 还未 判定 */
      if (isX) {
        // x 方向
        /* 交互主table有 两个 */
        if (triggerType.now === 3) {
          if (total > 0) {
            total = 0;
          }
          if (Math.abs(width - sideWidth) + total < 0) {
            total = sideWidth - width;
            // console.log(total);
          }
        }
        if (triggerType.now === 1) {
          if (total < 0) {
            total = 0;
          }
          if (Math.abs(width - sideWidth) - total < 0) {
            total = width - sideWidth;
          }
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
      setBase({
        ...base,
        x,
        y
      });
      /* 获取触发区域 */
      if (triggerType.now) {
        // console.log(triggerType.now);
        setTriggerType({
          ...triggerType,
          prev: triggerType.now
        });
      }
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
  }, [start, dValue, base, loading, inherScroll, sideWidth, triggerType]);
  /* triggerType 这里的依赖 一定要写，不然 prev 的数据 就会掉  */

  /* 第一次初始化 */
  useEffect(() => {
    /* 实际 内部 滚动的实际长度 */
    tableSize.current.realHeight = parseInt(getComputedStyle(realTableBodyRef.current).height);
    /* 容器的宽高 */
    tableSize.current.containerHeight = parseInt(getComputedStyle(TableRef.current).height) - 40;
    /* 实际table 的宽度 */
    tableSize.current.containerWidth = parseInt(getComputedStyle(TableRef.current).width);
    const { columns } = props;
    let width = 0;
    const leftList = [];
    const rightList = [];
    const centerList = [];

    columns.forEach((col) => {
      if (col.position === 'left') {
        leftList.push(col);
      } else if (col.position === 'right') {
        rightList.push(col);
      } else {
        centerList.push(col);
      }
    });

    const leftListWidth = leftList.reduce((prev, next) => (prev += next.width), 0);

    const rightListWidth = rightList.reduce((prev, next) => (prev += next.width), 0);

    const centerListWidth = centerList.reduce((prev, next) => (prev += next.width), 0);

    width = Math.min(leftListWidth, rightListWidth);
    /* 这里的 标准值 不是总的 宽度 */
    const containerWidth = (tableSize.current.containerWidth - centerListWidth) / 2;
    if (containerWidth < width) {
      setWidth(width);
    } else {
      setWidth(containerWidth);
    }
    setSideWidth(containerWidth);
    setCenterWidth(centerListWidth);
    setLeftList(leftList);
    setRightList(rightList);
    setCenterList(centerList);
  }, []);

  const initSize = () => {
    setTriggerType({
      now: 0,
      prev: 0
    });
    setBase({
      x: 0,
      y: 0
    });
    setDValue({
      x: 0,
      y: 0
    });
  }
  /* 切换视图显示 */
  useEffect(() => {
    /* 切换 t 型报价的 展示 0：全部，1：left，2：right */
    const { view } = props;
    // console.log(view, tableSize, centerWidth);
    let tempWidth;
    if (view === 0) {
      tempWidth = (tableSize.current.containerWidth - centerWidth) / 2;
    } else {
      tempWidth = tableSize.current.containerWidth - centerWidth;
    }
    initSize();
    setSideWidth(tempWidth);
  }, [props.view, centerWidth]);

  const { className, tableHeight, view } = props;

  return (
    <div ref={TableRef} className={`${className ? className : ''} table-container`}>
      <div
        className={`table-side-scroll ${loading === 2 ? 'table-body-more' : ''}`}
        style={{ height: `${tableHeight}px` }}
      >
        <div className={'table-side table-side-left'} style={{ width: `${view === 2 ? 0 : sideWidth}px` }}>
          <LeftTable
            scrollType="main"
            {...dValue}
            inherScroll={inherScroll}
            loading={loading}
            {...props}
            scrollWidth={Math.abs(width - sideWidth)}
            triggerType={triggerType.now}
            triggerTypePrev={triggerType.prev}
            columns={leftList}
            height={tableHeight}
            width={width}
            scrollClassName={'main-scroll'}
          />
        </div>
        <div className={'table-center table-side-body'} style={{ width: `${centerWidth}px` }}>
          <BaseTable
            scrollType="left"
            {...dValue}
            inherScroll={inherScroll}
            loading={loading}
            {...props}
            columns={centerList}
            height={tableHeight}
            width={centerWidth}
            realTableBodyRef={realTableBodyRef}
            scrollClassName={'main-scroll'}
          />
        </div>
        <div className={'table-side table-side-right'} style={{ width: `${view === 1 ? 0 : sideWidth}px` }}>
          <RightTable
            scrollType="main"
            {...dValue}
            inherScroll={inherScroll}
            loading={loading}
            {...props}
            triggerType={triggerType.now}
            triggerTypePrev={triggerType.prev}
            columns={rightList}
            height={tableHeight}
            width={width}
            scrollClassName={'main-scroll'}
          />
        </div>
      </div>
    </div>
  );
}

export default TTable;
